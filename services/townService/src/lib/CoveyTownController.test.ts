import { mock, mockReset } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { Socket } from 'socket.io';
import * as TestUtils from '../client/TestUtils';
import { BoundingBox, ServerConversationArea } from '../client/TownsServiceClient';
import { UserLocation } from '../CoveyTypes';
import { townSubscriptionHandler } from '../requestHandlers/CoveyTownRequestHandlers';
import CoveyTownListener from '../types/CoveyTownListener';
import Player from '../types/Player';
import PlayerSession from '../types/PlayerSession';
import CoveyTownController from './CoveyTownController';
import CoveyTownsStore from './CoveyTownsStore';
import TwilioVideo from './TwilioVideo';

jest.mock('./TwilioVideo');

const mockGetTokenForTown = jest.fn();
// eslint-disable-next-line
// @ts-ignore it's a mock
TwilioVideo.getInstance = () => ({
  getTokenForTown: mockGetTokenForTown,
});

function generateTestLocation(): UserLocation {
  return {
    rotation: 'back',
    moving: Math.random() < 0.5,
    x: Math.floor(Math.random() * 100),
    y: Math.floor(Math.random() * 100),
  };
}

function expectArraysToContainSameMembers<T>(actual:T[], expected:T[]) : void{
  expect(actual.length).toBe(expected.length);
  expected.forEach(expectedVal => expect(actual.find(actualVal => actualVal === expectedVal)).toBeDefined());
}

describe('CoveyTownController', () => {
  beforeEach(() => {
    mockGetTokenForTown.mockClear();
  });
  it('constructor should set the friendlyName property', () => { 
    const townName = `FriendlyNameTest-${nanoid()}`;
    const townController = new CoveyTownController(townName, false);
    expect(townController.friendlyName)
      .toBe(townName);
  });
  describe('addPlayer', () => { 
    it('should use the coveyTownID and player ID properties when requesting a video token',
      async () => {
        const townName = `FriendlyNameTest-${nanoid()}`;
        const townController = new CoveyTownController(townName, false);
        const newPlayerSession = await townController.addPlayer(new Player(nanoid()));
        expect(mockGetTokenForTown).toBeCalledTimes(1);
        expect(mockGetTokenForTown).toBeCalledWith(townController.coveyTownID, newPlayerSession.player.id);
      });
  });
  describe('town listeners and events', () => {
    let testingTown: CoveyTownController;
    const mockListeners = [mock<CoveyTownListener>(),
      mock<CoveyTownListener>(),
      mock<CoveyTownListener>()];
    beforeEach(() => {
      const townName = `town listeners and events tests ${nanoid()}`;
      testingTown = new CoveyTownController(townName, false);
      mockListeners.forEach(mockReset);
    });
    it('should notify added listeners of player movement when updatePlayerLocation is called', async () => {
      const player = new Player('test player');
      await testingTown.addPlayer(player);
      const newLocation = generateTestLocation();
      mockListeners.forEach(listener => testingTown.addTownListener(listener));
      testingTown.updatePlayerLocation(player, newLocation);
      mockListeners.forEach(listener => expect(listener.onPlayerMoved).toBeCalledWith(player));
    });
    it('should notify added listeners of player disconnections when destroySession is called', async () => {
      const player = new Player('test player');
      const session = await testingTown.addPlayer(player);

      mockListeners.forEach(listener => testingTown.addTownListener(listener));
      testingTown.destroySession(session);
      mockListeners.forEach(listener => expect(listener.onPlayerDisconnected).toBeCalledWith(player));
    });
    it('should notify added listeners of new players when addPlayer is called', async () => {
      mockListeners.forEach(listener => testingTown.addTownListener(listener));

      const player = new Player('test player');
      await testingTown.addPlayer(player);
      mockListeners.forEach(listener => expect(listener.onPlayerJoined).toBeCalledWith(player));

    });
    it('should notify added listeners that the town is destroyed when disconnectAllPlayers is called', async () => {
      const player = new Player('test player');
      await testingTown.addPlayer(player);

      mockListeners.forEach(listener => testingTown.addTownListener(listener));
      testingTown.disconnectAllPlayers();
      mockListeners.forEach(listener => expect(listener.onTownDestroyed).toBeCalled());

    });
    it('should not notify removed listeners of player movement when updatePlayerLocation is called', async () => {
      const player = new Player('test player');
      await testingTown.addPlayer(player);

      mockListeners.forEach(listener => testingTown.addTownListener(listener));
      const newLocation = generateTestLocation();
      const listenerRemoved = mockListeners[1];
      testingTown.removeTownListener(listenerRemoved);
      testingTown.updatePlayerLocation(player, newLocation);
      expect(listenerRemoved.onPlayerMoved).not.toBeCalled();
    });
    it('should not notify removed listeners of player disconnections when destroySession is called', async () => {
      const player = new Player('test player');
      const session = await testingTown.addPlayer(player);

      mockListeners.forEach(listener => testingTown.addTownListener(listener));
      const listenerRemoved = mockListeners[1];
      testingTown.removeTownListener(listenerRemoved);
      testingTown.destroySession(session);
      expect(listenerRemoved.onPlayerDisconnected).not.toBeCalled();

    });
    it('should not notify removed listeners of new players when addPlayer is called', async () => {
      const player = new Player('test player');

      mockListeners.forEach(listener => testingTown.addTownListener(listener));
      const listenerRemoved = mockListeners[1];
      testingTown.removeTownListener(listenerRemoved);
      const session = await testingTown.addPlayer(player);
      testingTown.destroySession(session);
      expect(listenerRemoved.onPlayerJoined).not.toBeCalled();
    });

    it('should not notify removed listeners that the town is destroyed when disconnectAllPlayers is called', async () => {
      const player = new Player('test player');
      await testingTown.addPlayer(player);

      mockListeners.forEach(listener => testingTown.addTownListener(listener));
      const listenerRemoved = mockListeners[1];
      testingTown.removeTownListener(listenerRemoved);
      testingTown.disconnectAllPlayers();
      expect(listenerRemoved.onTownDestroyed).not.toBeCalled();

    });
  });
  describe('townSubscriptionHandler', () => {
    const mockSocket = mock<Socket>();
    let testingTown: CoveyTownController;
    let player: Player;
    let session: PlayerSession;
    beforeEach(async () => {
      const townName = `connectPlayerSocket tests ${nanoid()}`;
      testingTown = CoveyTownsStore.getInstance().createTown(townName, false);
      mockReset(mockSocket);
      player = new Player('test player');
      session = await testingTown.addPlayer(player);
    });
    it('should reject connections with invalid town IDs by calling disconnect', async () => {
      TestUtils.setSessionTokenAndTownID(nanoid(), session.sessionToken, mockSocket);
      townSubscriptionHandler(mockSocket);
      expect(mockSocket.disconnect).toBeCalledWith(true);
    });
    it('should reject connections with invalid session tokens by calling disconnect', async () => {
      TestUtils.setSessionTokenAndTownID(testingTown.coveyTownID, nanoid(), mockSocket);
      townSubscriptionHandler(mockSocket);
      expect(mockSocket.disconnect).toBeCalledWith(true);
    });
    describe('with a valid session token', () => {
      it('should add a town listener, which should emit "newPlayer" to the socket when a player joins', async () => {
        TestUtils.setSessionTokenAndTownID(testingTown.coveyTownID, session.sessionToken, mockSocket);
        townSubscriptionHandler(mockSocket);
        await testingTown.addPlayer(player);
        expect(mockSocket.emit).toBeCalledWith('newPlayer', player);
      });
      it('should add a town listener, which should emit "playerMoved" to the socket when a player moves', async () => {
        TestUtils.setSessionTokenAndTownID(testingTown.coveyTownID, session.sessionToken, mockSocket);
        townSubscriptionHandler(mockSocket);
        testingTown.updatePlayerLocation(player, generateTestLocation());
        expect(mockSocket.emit).toBeCalledWith('playerMoved', player);

      });
      it('should add a town listener, which should emit "playerDisconnect" to the socket when a player disconnects', async () => {
        TestUtils.setSessionTokenAndTownID(testingTown.coveyTownID, session.sessionToken, mockSocket);
        townSubscriptionHandler(mockSocket);
        testingTown.destroySession(session);
        expect(mockSocket.emit).toBeCalledWith('playerDisconnect', player);
      });
      it('should add a town listener, which should emit "townClosing" to the socket and disconnect it when disconnectAllPlayers is called', async () => {
        TestUtils.setSessionTokenAndTownID(testingTown.coveyTownID, session.sessionToken, mockSocket);
        townSubscriptionHandler(mockSocket);
        testingTown.disconnectAllPlayers();
        expect(mockSocket.emit).toBeCalledWith('townClosing');
        expect(mockSocket.disconnect).toBeCalledWith(true);
      });
      describe('when a socket disconnect event is fired', () => {
        it('should remove the town listener for that socket, and stop sending events to it', async () => {
          TestUtils.setSessionTokenAndTownID(testingTown.coveyTownID, session.sessionToken, mockSocket);
          townSubscriptionHandler(mockSocket);

          // find the 'disconnect' event handler for the socket, which should have been registered after the socket was connected
          const disconnectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect');
          if (disconnectHandler && disconnectHandler[1]) {
            disconnectHandler[1]();
            const newPlayer = new Player('should not be notified');
            await testingTown.addPlayer(newPlayer);
            expect(mockSocket.emit).not.toHaveBeenCalledWith('newPlayer', newPlayer);
          } else {
            fail('No disconnect handler registered');
          }
        });
        it('should destroy the session corresponding to that socket', async () => {
          TestUtils.setSessionTokenAndTownID(testingTown.coveyTownID, session.sessionToken, mockSocket);
          townSubscriptionHandler(mockSocket);

          // find the 'disconnect' event handler for the socket, which should have been registered after the socket was connected
          const disconnectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect');
          if (disconnectHandler && disconnectHandler[1]) {
            disconnectHandler[1]();
            mockReset(mockSocket);
            TestUtils.setSessionTokenAndTownID(testingTown.coveyTownID, session.sessionToken, mockSocket);
            townSubscriptionHandler(mockSocket);
            expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
          } else {
            fail('No disconnect handler registered');
          }

        });
      });
      it('should forward playerMovement events from the socket to subscribed listeners', async () => {
        TestUtils.setSessionTokenAndTownID(testingTown.coveyTownID, session.sessionToken, mockSocket);
        townSubscriptionHandler(mockSocket);
        const mockListener = mock<CoveyTownListener>();
        testingTown.addTownListener(mockListener);
        // find the 'playerMovement' event handler for the socket, which should have been registered after the socket was connected
        const playerMovementHandler = mockSocket.on.mock.calls.find(call => call[0] === 'playerMovement');
        if (playerMovementHandler && playerMovementHandler[1]) {
          const newLocation = generateTestLocation();
          player.location = newLocation;
          playerMovementHandler[1](newLocation);
          expect(mockListener.onPlayerMoved).toHaveBeenCalledWith(player);
        } else {
          fail('No playerMovement handler registered');
        }
      });
    });
  });
  describe('Conversation Areas', () =>{
    let testingTown: CoveyTownController;
    let mockListeners = [mock<CoveyTownListener>(),
      mock<CoveyTownListener>(),
      mock<CoveyTownListener>()];

    function resetMockListeners() {
      mockListeners.forEach(listener => {
        listener.onConversationAreaDestroyed.mockClear();
        listener.onConversationAreaUpdated.mockClear();
        listener.onPlayerDisconnected.mockClear();
        listener.onPlayerJoined.mockClear();
        listener.onPlayerMoved.mockClear();
        listener.onTownDestroyed.mockClear();
      });
    }
    beforeEach(() => {
      mockListeners = [
        mock<CoveyTownListener>(),
        mock<CoveyTownListener>(),
        mock<CoveyTownListener>(),
      ];
      const townName = `addConversationArea test town ${nanoid()}`;
      testingTown = new CoveyTownController(townName, false);
      mockListeners.forEach(listener => testingTown.addTownListener(listener));
    });

    function generateOverlappingBoxes(): BoundingBox[][]{
      function box(x:number, y:number, kind:'tall' | 'flat' | 'square') : BoundingBox{
        return { x, y, width: (kind !== 'tall' ? 0.9 : 0.5), height: (kind !== 'flat' ? 0.9 : 0.5) };
      }
      function boxT(x:number, y:number, kind:'tall' | 'flat' | 'square') : BoundingBox{
        return { x, y, width: 2 * (kind !== 'tall' ? 0.9 : 0.5), height: 2 * (kind !== 'flat' ? 0.9 : 0.5) };
      }
      const baseX = 10000;
      const baseY = 10000;
      function translate(_box: BoundingBox): BoundingBox{
        return {
          x: _box.x * 2 + baseX,
          y : _box.y * 2 + baseY,
          height: _box.height * 2,
          width: _box.width * 2,
        };
      }
      const base = [
        box(1, 1, 'square'), box(2, 1, 'square'), box(3, 1, 'square'),
        box(1, 2, 'square'), box(2, 2, 'square'), box(3, 2, 'square'),
        box(1, 3, 'square'), box(2, 3, 'square'), box(3, 3, 'square'),
      ].map(translate);
      const above = [
        boxT(0, 0.5, 'square'), boxT(1.5, 0.5, 'tall'), boxT(3, 0.5, 'square'),
        boxT(0, 2, 'flat'), { x:2, y:2, width:0.5, height:0.5 }, boxT(3.5, 2, 'flat'),
        boxT(0, 3.5, 'square'), boxT(1.5, 3.5, 'tall'), boxT(3.5, 3.5, 'square'),
      ].map(translate);
      return [base, above];
    }
    function randomInt(_min:number, _max:number): number {
      const min = Math.ceil(_min) + 1;
      const max = Math.floor(_max);
      return Math.floor(Math.random() * (max - min) + min); 
    }
    function createPlayersInBox(boxInside: BoundingBox, numPlayers: number): string[]{
      const ret = [];
      for (let i = 0; i < numPlayers; i += 1){
        const x = randomInt(boxInside.x - boxInside.width / 2, boxInside.x + boxInside.width / 2);
        const y = randomInt(boxInside.y - boxInside.height / 2, boxInside.y + boxInside.height / 2);
        const player = new Player(nanoid());
        player.location = { x, y, moving: false, rotation: 'front' };
        testingTown.players.push(player);
        ret.push(player.id);
      }
      return ret;
    }
    function createPlayersNotInBox(box:BoundingBox) : string[]{
      const left = new Player(nanoid());
      left.location = { x : box.x - box.width / 2, y: box.y - box.height / 2, moving: false, rotation:'front' };
      const right = new Player(nanoid());
      right.location = { x : box.x - box.width / 2, y: box.y - box.height / 2, moving: false, rotation:'front' };
      const top = new Player(nanoid());

      top.location = { x : box.x - box.width / 2, y: box.y - box.height / 2, moving: false, rotation:'front' };
      const bottom = new Player(nanoid());
      bottom.location = { x : box.x - box.width / 2, y: box.y - box.height / 2, moving: false, rotation:'front' };
      const corner = new Player(nanoid());
      corner.location = { x : box.x - box.width / 2, y: box.y - box.height / 2, moving: false, rotation:'front' };

      testingTown.players.push(left);
      testingTown.players.push(right);
      testingTown.players.push(top);
      testingTown.players.push(bottom);
      testingTown.players.push(corner);
      return [left.id, right.id, top.id, bottom.id, corner.id];
    }
    function expectConversationAreas(expected:ServerConversationArea[], expectedOccupants:string[][] = []){
      const actual = testingTown.conversationAreas;
      expect(actual.length).toBe(expected.length);
      for (let i = 0; i < expected.length; i += 1){
        const expectedArea = expected[i];
        let expectedAreaOccupants:string[] = [];
        if (expectedOccupants.length > i){
          expectedAreaOccupants = expectedOccupants[i];
        }
        const actualArea = actual.find(eachActualArea => eachActualArea.label === expectedArea.label);
        expect(actualArea).toBeDefined();
        if (actualArea) {
          expect(actualArea.boundingBox).toEqual(expectedArea.boundingBox);
          expect(actualArea.topic).toEqual(expectedArea.topic);
          expect(actualArea.occupantsByID.length).toEqual(expectedAreaOccupants.length);
          for (let k = 0; k < expectedAreaOccupants.length; k += 1){
            const playerID = expectedAreaOccupants[k];
            expect(actualArea.occupantsByID.find(id => id === playerID)).toBeDefined();
            const player = testingTown.players.find(p => p.id === playerID);
            expect(player).toBeDefined();
            if (player) {
              expect(player.activeConversationArea).toBe(actualArea);
            }
          }
        }
      }
    }
    function expectConversationAreaToHaveMembers(conversationLabel: string, expectedOccupants: string[]){
      const actual = testingTown.conversationAreas.find(area => area.label === conversationLabel);
      expect(actual).toBeDefined();
      if (actual){
        expectArraysToContainSameMembers(actual.occupantsByID, expectedOccupants);
      }
    }

    const box1 :BoundingBox = { height: 10, width: 5, x: 10, y: 10 };
    const box1Overlap :BoundingBox = { height: 4, width: 4, x: 8, y: 4 }; 

    const box2:BoundingBox = { height: 10, width:10, x: 40, y: 50 };
    const box2Overlap:BoundingBox = { height: 20, x: 45, y: 36, width: 2 }; 

    const box3: BoundingBox = { height: 40, width:28, x: 60, y: 50 };
    const box3Overlap:BoundingBox = { height: 10, width: 4, x:60, y:70 };

    const box4:BoundingBox = { height: 10, width: 10, x: 200, y: 200 }; 

    const [gridBase, gridOverlap] = generateOverlappingBoxes();
    const boxes = [box1, box2, box3, box4].concat(gridBase);
    const overlappingBoxes = [box1Overlap, box2Overlap, box3Overlap].concat(gridOverlap);
    describe('addConversationArea', () => {
      it('should add the conversation area to the list of conversation areas [T1.2b]', ()=>{
        const newConversationArea = TestUtils.createConversationForTesting();
        const result = testingTown.addConversationArea(newConversationArea);
        expect(result).toBe(true);
        expectConversationAreas([newConversationArea]);
      });
      it('should check to see if a conversation area exists with the given label [T1.2b]', ()=>{
        const newConversationArea = TestUtils.createConversationForTesting({ boundingBox: box1 });
        const dupArea = TestUtils.createConversationForTesting({ conversationLabel: newConversationArea.label, boundingBox: box2 });

        // Add a valid area
        expect(testingTown.addConversationArea(newConversationArea)).toBe(true);
        expectConversationAreas([newConversationArea]);

        // Add new area same label
        expect(testingTown.addConversationArea(dupArea)).toBe(false);
        expectConversationAreas([newConversationArea]);

        // Add new area that's an exact dup
        expect(testingTown.addConversationArea(newConversationArea)).toBe(false);
        expectConversationAreas([newConversationArea]);

      });
      it('should allow multiple conversations with the same topic [T1.2b]', ()=>{
        const newConversationArea = TestUtils.createConversationForTesting({ boundingBox: box1 });
        const dupArea = TestUtils.createConversationForTesting({ conversationTopic: newConversationArea.topic, boundingBox: box2 });

        // Add a valid area
        expect(testingTown.addConversationArea(newConversationArea)).toBe(true);
        expectConversationAreas([newConversationArea]);

        // Add new area same topic
        expect(testingTown.addConversationArea(dupArea)).toBe(true);
        expectConversationAreas([newConversationArea, dupArea]);
      });
      it('should not allow an empty topic [T1.2b]', () =>{
        const validArea = TestUtils.createConversationForTesting({ boundingBox: box1 });
        const emptyTopic = TestUtils.createConversationForTesting({ boundingBox: box3 });
        emptyTopic.topic = '';

        expect(testingTown.addConversationArea(validArea)).toBe(true);
        expectConversationAreas([validArea]);

        expect(testingTown.addConversationArea(emptyTopic)).toBe(false);
        expectConversationAreas([validArea]);
      });
      it('should check for overlapping bounding boxes [T1.2b]', async ()=>{
        const validAreas = boxes.map(box => TestUtils.createConversationForTesting({ boundingBox: box }));
        const invalidAreas = overlappingBoxes.map(box => TestUtils.createConversationForTesting({ boundingBox: box }));
        validAreas.forEach(validArea => expect(testingTown.addConversationArea(validArea)).toBe(true));
        expectConversationAreas(validAreas);
        invalidAreas.forEach(invalidArea => expect(testingTown.addConversationArea(invalidArea)).toBe(false));
        expectConversationAreas(validAreas);
      });
      it('should allow adjacent bounding boxes [T1.2b]', async () =>{
        function box(x:number, y:number) : BoundingBox{
          return { x, y, width: 1, height: 1 };
        }
        const adjacentBoxes = [box(0, 0), box(1, 0), box(2, 0),
          box(0, 1), box(1, 1), box(2, 1),
          box(0, 2), box(1, 2), box(2, 2)];
        const adjacentAreas = adjacentBoxes.map(_box => TestUtils.createConversationForTesting({ boundingBox: _box }));
        adjacentAreas.forEach(validArea => expect(testingTown.addConversationArea(validArea)).toBe(true));
        expectConversationAreas(adjacentAreas);

      });
      it('should include players in the bounding box as occupants when a conversation is created and set their activeConversation property [T1.2b]', async ()=>{
        const playersByBox = boxes.map((box)=>createPlayersInBox(box, 10));
        boxes.map(box => createPlayersNotInBox(box));
        const areas = boxes.map(box => TestUtils.createConversationForTesting({ boundingBox: box }));
        areas.forEach(validArea => expect(testingTown.addConversationArea(validArea)).toBe(true));
        expectConversationAreas(areas, playersByBox);
      });
      it('should notify all listeners when a conversation area is created [T1.2b]', ()=>{

        // Create some valid areas, add them, check for listener messages
        const areas = boxes.map(box => TestUtils.createConversationForTesting({ boundingBox: box }));
        areas.forEach(validArea => expect(testingTown.addConversationArea(validArea)).toBe(true));
        mockListeners.forEach(listener => {
          expect(listener.onConversationAreaDestroyed).toBeCalledTimes(0);
          expect(listener.onPlayerDisconnected).toBeCalledTimes(0);
          expect(listener.onPlayerJoined).toBeCalledTimes(0);
          expect(listener.onTownDestroyed).toBeCalledTimes(0);

          expect(listener.onConversationAreaUpdated).toHaveBeenCalledTimes(areas.length);
          const expectedCalls = areas.map(area => [area]);
          expect(listener.onConversationAreaUpdated.mock.calls).toEqual(expectedCalls);
        });
        mockListeners.forEach(listener => listener.onConversationAreaUpdated.mockClear());

        // Create some invalid ones, then assert no listener calls
        const invalidAreas = overlappingBoxes.map(box => TestUtils.createConversationForTesting({ boundingBox: box }));
        invalidAreas.forEach(invalid => expect(testingTown.addConversationArea(invalid)).toBe(false));
        mockListeners.forEach(listener =>{
          expect(listener.onConversationAreaUpdated).toHaveBeenCalledTimes(0);
        });
      });

    });
    describe('updatePlayerLocation', () =>{
      let testingPlayer: Player;
      let preCreatedAreas: ServerConversationArea[];
      beforeEach(async () => {
        testingPlayer = new Player(nanoid());
        await testingTown.addPlayer(testingPlayer);
        preCreatedAreas = [];
        for (let i = 0; i < boxes.length; i += 1) {
          preCreatedAreas.push(TestUtils.createConversationForTesting({ boundingBox: boxes[i], conversationLabel: `Label${i}`, conversationTopic: `Topic${i}` }));
        }
        preCreatedAreas.forEach(area => expect(testingTown.addConversationArea(area)).toBe(true));
      });
      const removePlayerFromConversationAreaAndExpectUpdate = (player: Player) =>{
        const newLocation: UserLocation = { ...player.location };
        const previousArea = player.activeConversationArea;
        if (!previousArea){
          expect(previousArea).toBeDefined();
          return;
        }
        const expectedPreviousAreaMembers = previousArea.occupantsByID.filter(id => id !== player.id);
        newLocation.conversationLabel = undefined;
        resetMockListeners();
        testingTown.updatePlayerLocation(player, newLocation);
        mockListeners.forEach(listener => {
          if (expectedPreviousAreaMembers.length === 0){
            expect(listener.onConversationAreaUpdated).not.toHaveBeenCalled();

            expect(listener.onConversationAreaDestroyed).toHaveBeenCalledTimes(1);
            const [actualDestroyed] = listener.onConversationAreaDestroyed.mock.calls[0];
            expect(actualDestroyed.label).toEqual(previousArea.label);
            expect(actualDestroyed.boundingBox).toEqual(previousArea.boundingBox);
            expect(actualDestroyed.topic).toEqual(previousArea.topic);
            expect(actualDestroyed.occupantsByID.length).toBe(0);
          } else {
            expect(listener.onConversationAreaUpdated).toHaveBeenCalledTimes(1);
            const [actualLeaving] = listener.onConversationAreaUpdated.mock.calls[0];
            expect(actualLeaving.label).toEqual(previousArea.label);
            expect(actualLeaving.boundingBox).toEqual(previousArea.boundingBox);
            expect(actualLeaving.topic).toEqual(previousArea.topic);
            expectArraysToContainSameMembers(actualLeaving.occupantsByID, expectedPreviousAreaMembers);
          }
        });
      };
      const putPlayerInConversationAreaAndExpectUpdate = (
        player: Player,
        area: ServerConversationArea,
      ) => {
        const newLocation: UserLocation = { ...player.location };
        const previousArea = player.activeConversationArea;
        const expectedPreviousAreaMembers = previousArea?.occupantsByID.filter(id => id !== player.id);
        const expectedAreaEntered: ServerConversationArea = { ...area };
        expectedAreaEntered.occupantsByID = expectedAreaEntered.occupantsByID.concat([player.id]);
        newLocation.conversationLabel = area.label;
        resetMockListeners();
        testingTown.updatePlayerLocation(player, newLocation);
        mockListeners.forEach(listener => {
          if (previousArea && expectedPreviousAreaMembers) {
            if (expectedPreviousAreaMembers.length === 0){
              expect(listener.onConversationAreaUpdated).toHaveBeenCalledTimes(1);
              const [actual] = listener.onConversationAreaUpdated.mock.calls[0];
              expect(actual.label).toEqual(area.label);
              expect(actual.boundingBox).toEqual(area.boundingBox);
              expect(actual.topic).toEqual(area.topic);
              expectArraysToContainSameMembers(actual.occupantsByID, expectedAreaEntered.occupantsByID);

              expect(listener.onConversationAreaDestroyed).toHaveBeenCalledTimes(1);
              const [actualDestroyed] = listener.onConversationAreaDestroyed.mock.calls[0];
              expect(actualDestroyed.label).toEqual(previousArea.label);
              expect(actualDestroyed.boundingBox).toEqual(previousArea.boundingBox);
              expect(actualDestroyed.topic).toEqual(previousArea.topic);
              expect(actualDestroyed.occupantsByID.length).toBe(0);
            } else {
              expect(listener.onConversationAreaUpdated).toHaveBeenCalledTimes(2);
              const [actualLeaving] = listener.onConversationAreaUpdated.mock.calls[0];
              expect(actualLeaving.label).toEqual(previousArea.label);
              expect(actualLeaving.boundingBox).toEqual(previousArea.boundingBox);
              expect(actualLeaving.topic).toEqual(previousArea.topic);
              expectArraysToContainSameMembers(actualLeaving.occupantsByID, expectedPreviousAreaMembers);

              const [actual] = listener.onConversationAreaUpdated.mock.calls[1];
              expect(actual.label).toEqual(area.label);
              expect(actual.boundingBox).toEqual(area.boundingBox);
              expect(actual.topic).toEqual(area.topic);
              expectArraysToContainSameMembers(actual.occupantsByID, expectedAreaEntered.occupantsByID);
            }
          } else {
            expect(listener.onConversationAreaUpdated).toHaveBeenCalledTimes(1);
            const [actual] = listener.onConversationAreaUpdated.mock.calls[0];
            expect(actual.label).toEqual(area.label);
            expect(actual.boundingBox).toEqual(area.boundingBox);
            expect(actual.topic).toEqual(area.topic);
            expectArraysToContainSameMembers(actual.occupantsByID, expectedAreaEntered.occupantsByID);
          }
        });
      };
      it('should set a conversation area\'s occupantsByID property when a player moves into a conversation area [T2.1]', ()=>{
        const newConversationArea = preCreatedAreas[0];
        const newLocation:UserLocation = { moving: false, rotation: 'front', x: 10, y: 10, conversationLabel: newConversationArea.label };
        testingTown.updatePlayerLocation(testingPlayer, newLocation);
        expect(testingPlayer.activeConversationArea?.label).toEqual(newConversationArea.label);
        expect(testingPlayer.activeConversationArea?.topic).toEqual(newConversationArea.topic);
        expect(testingPlayer.activeConversationArea?.boundingBox).toEqual(newConversationArea.boundingBox);
        const expectedOccupantsByArea:string[][] = preCreatedAreas.map(() => []);
        expectedOccupantsByArea[0] = [testingPlayer.id];
        expectConversationAreas(preCreatedAreas, expectedOccupantsByArea);
      }); 
      it('should respect the `activeConversationArea` property reported by the player, and not override it when a player moves into a different, existing conversation area [T2.1]', async ()=>{
        const playerLocatedInArea3ID = createPlayersInBox(box3, 1)[0];
        const playerLocatedInArea3 = testingTown.players.find(player => player.id === playerLocatedInArea3ID);
        expect(playerLocatedInArea3).toBeDefined();
        if (!playerLocatedInArea3){
          return;
        }
        const newLoc :UserLocation = Object.assign(playerLocatedInArea3.location);
        testingTown.updatePlayerLocation(playerLocatedInArea3, newLoc);
        // Should still not be in a conv area
        expect(playerLocatedInArea3.activeConversationArea).toBeUndefined();
        // areas should have no occupants
        expectConversationAreas(preCreatedAreas);

        // move to box1
        const box1Loc :UserLocation = Object.assign(playerLocatedInArea3.location);
        box1Loc.conversationLabel = preCreatedAreas[0].label;

        testingTown.updatePlayerLocation(playerLocatedInArea3, box1Loc);
        const expectedOccupants: string[][] = preCreatedAreas.map(()=>[]);
        expectedOccupants[0] = [playerLocatedInArea3ID];
        // box 1 should have occupant
        expectConversationAreas(preCreatedAreas, expectedOccupants);
      });
      it('should emit onConversationUpdated when players enter or exit [T2.1]', async ()=>{
        const newPlayer = new Player('will move a lot');
        newPlayer.location = { x: 10000, y: 10000, moving: false, rotation: 'front' };
        testingTown.players.push(newPlayer);
        const areaOneHolder = new Player('will make sure area 1 doesnt close');
        areaOneHolder.location = { x: 10000, y: 10000, moving: false, rotation: 'front' };
        testingTown.players.push(newPlayer);
        expectConversationAreas(preCreatedAreas);

        putPlayerInConversationAreaAndExpectUpdate(testingPlayer, preCreatedAreas[0]);
        expectConversationAreaToHaveMembers(preCreatedAreas[0].label, [testingPlayer.id]);

        putPlayerInConversationAreaAndExpectUpdate(newPlayer, preCreatedAreas[0]);
        expectConversationAreaToHaveMembers(preCreatedAreas[0].label, [testingPlayer.id, newPlayer.id]);

        putPlayerInConversationAreaAndExpectUpdate(newPlayer, preCreatedAreas[1]);
        putPlayerInConversationAreaAndExpectUpdate(areaOneHolder, preCreatedAreas[1]);
        expectConversationAreaToHaveMembers(preCreatedAreas[0].label, [testingPlayer.id]);
        expectConversationAreaToHaveMembers(preCreatedAreas[1].label, [newPlayer.id, areaOneHolder.id]);

        putPlayerInConversationAreaAndExpectUpdate(newPlayer, preCreatedAreas[2]);
        expectConversationAreaToHaveMembers(preCreatedAreas[1].label, [areaOneHolder.id]);
        expectConversationAreaToHaveMembers(preCreatedAreas[2].label, [newPlayer.id]);
      });
      it('should only emit onConversationUpdated events for conversations that update [T2.1]', async ()=>{
        putPlayerInConversationAreaAndExpectUpdate(testingPlayer, preCreatedAreas[0]);
        resetMockListeners();
        const updatedLocation = { ...testingPlayer.location };
        updatedLocation.conversationLabel = preCreatedAreas[0].label;
        updatedLocation.x += 1;
        updatedLocation.y += 1;
        testingTown.updatePlayerLocation(testingPlayer, updatedLocation);
        mockListeners.forEach(listener => expect(listener.onConversationAreaUpdated).not.toHaveBeenCalled());
        mockListeners.forEach(listener => expect(listener.onPlayerMoved).toHaveBeenCalled());
      });
      it('should remove a participant if they disconnect [T2.2]', async ()=>{
        const newPlayer = new Player('will move a lot');
        newPlayer.location = { x: 10000, y: 10000, moving: false, rotation: 'front' };
        const newPlayerSession = await testingTown.addPlayer(newPlayer);
        putPlayerInConversationAreaAndExpectUpdate(newPlayer, preCreatedAreas[0]);
        putPlayerInConversationAreaAndExpectUpdate(testingPlayer, preCreatedAreas[0]);
        expectConversationAreaToHaveMembers(preCreatedAreas[0].label, [newPlayer.id, testingPlayer.id]);
        testingTown.destroySession(newPlayerSession);
        expectConversationAreaToHaveMembers(preCreatedAreas[0].label, [testingPlayer.id]);
      });
      it('should emit onConversationUpdated when a participant disconnects [T2.2]', async ()=>{
        const newPlayer = new Player('will move a lot');
        newPlayer.location = { x: 10000, y: 10000, moving: false, rotation: 'front' };
        const newPlayerSession = await testingTown.addPlayer(newPlayer);
        putPlayerInConversationAreaAndExpectUpdate(newPlayer, preCreatedAreas[0]);
        putPlayerInConversationAreaAndExpectUpdate(testingPlayer, preCreatedAreas[0]);
        expectConversationAreaToHaveMembers(preCreatedAreas[0].label, [newPlayer.id, testingPlayer.id]);
        resetMockListeners();

        const expectedAreaUpdateMessage :ServerConversationArea = { ...preCreatedAreas[0] };
        expectedAreaUpdateMessage.occupantsByID = [testingPlayer.id];
        testingTown.destroySession(newPlayerSession);
        mockListeners.forEach(listener => {
          expect(listener.onPlayerDisconnected).toBeCalledTimes(1);
          expect(listener.onConversationAreaUpdated).toBeCalledTimes(1);
          expect(listener.onConversationAreaUpdated.mock.calls[0]).toEqual([expectedAreaUpdateMessage]);
        });
      });
      it('should emit onConversationAreaDestroyed when a conversation is destroyed [T2.3]', async ()=>{
        putPlayerInConversationAreaAndExpectUpdate(testingPlayer, preCreatedAreas[1]);
        removePlayerFromConversationAreaAndExpectUpdate(testingPlayer);
        const removedAreaLabel = preCreatedAreas[1].label;
        expectConversationAreas(preCreatedAreas.filter(a => a.label !== removedAreaLabel));
      });
      it('should not emit onConversationAreaDestroyed when a conversation is not destroyed [T2.3]', async ()=>{
        const newPlayer = new Player('will move a lot');
        newPlayer.location = { x: 10000, y: 10000, moving: false, rotation: 'front' };
        await testingTown.addPlayer(newPlayer);
        putPlayerInConversationAreaAndExpectUpdate(testingPlayer, preCreatedAreas[0]);
        putPlayerInConversationAreaAndExpectUpdate(newPlayer, preCreatedAreas[0]);
        removePlayerFromConversationAreaAndExpectUpdate(testingPlayer);
      });
    });
  });
});
