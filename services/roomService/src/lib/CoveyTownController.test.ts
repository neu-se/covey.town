import { mock, mockReset } from 'jest-mock-extended';
import { Socket } from 'socket.io';
import { nanoid } from 'nanoid';
import TwilioVideo from './TwilioVideo';
import CoveyTownListener from '../types/CoveyTownListener';
import CoveyTownController from './CoveyTownController';
import CoveyTownsStore from './CoveyTownsStore';
import Player from '../types/Player';
import { townSubscriptionHandler } from '../requestHandlers/CoveyTownRequestHandlers';
import * as TestUtils from '../TestUtils';
import { ConfigureTest, StartTest } from '../FaultManager';

// Set up a manual mock for the getTokenForTown function in TwilioVideo
jest.mock('./TwilioVideo');
const mockGetTokenForTown = jest.fn();
// eslint-disable-next-line
// @ts-ignore it's a mock
TwilioVideo.getInstance = () => ({
  getTokenForTown: mockGetTokenForTown,
});

function createTownAddListeners(listeners?: CoveyTownListener[]): CoveyTownController {
  const newController = new CoveyTownController('NewController', true);
  if (listeners && listeners.length > 0) {
    listeners.forEach((listener) => {
      newController.addTownListener(listener);
    });
  }
  return newController;
}

describe('CoveyTownController', () => {
  beforeEach(() => {
    // Reset any logged invocations of getTokenForTown before each test
    mockGetTokenForTown.mockClear();
  });
  it.each(ConfigureTest('CRCC'))('constructor should set the friendlyName property [%s]', (testConfiguration: string) => {
    StartTest(testConfiguration);
    const newController = createTownAddListeners();

    expect(newController.friendlyName).toBe('NewController');
    expect(newController.isPubliclyListed).toBeTruthy();
  });
  describe('addPlayer', () => {
    it.each(ConfigureTest('CRCAP'))('should use the coveyTownID and player ID properties when requesting a video token [%s]',
      async (testConfiguration: string) => {
        StartTest(testConfiguration);
        const newController = createTownAddListeners();
        const playerToAdd = new Player('Player1');

        await newController.addPlayer(playerToAdd);

        expect(mockGetTokenForTown).toHaveBeenCalledWith(newController.coveyTownID, playerToAdd.id);
      });
  });
  describe('town listeners and events', () => {
    // Set up mock town listeners, you will likely find it useful to use these in the town listener tests.
    // Feel free to change these lines as you see fit, or leave them and use them as-is
    const mockListeners = [mock<CoveyTownListener>(),
      mock<CoveyTownListener>(),
      mock<CoveyTownListener>()];
    beforeEach(() => {
      mockListeners.forEach(mockReset);
    });
    it.each(ConfigureTest('RLEMV'))('should notify added listeners of player movement when updatePlayerLocation is called [%s]', async (testConfiguration: string) => {
      StartTest(testConfiguration);
      const newController = createTownAddListeners([mockListeners[0]]);
      const playerToMove = new Player('Player1');
      await newController.addPlayer(playerToMove);

      newController.updatePlayerLocation(playerToMove, { x: 1, y: 1, rotation: 'front', moving: true });
      newController.addTownListener(mockListeners[2]);
      newController.updatePlayerLocation(playerToMove, { x: 1, y: 1, rotation: 'front', moving: true });

      expect(mockListeners[0].onPlayerMoved).toHaveBeenCalledWith(playerToMove);
      expect(mockListeners[0].onPlayerMoved).toBeCalledTimes(2);
      expect(mockListeners[2].onPlayerMoved).toHaveBeenCalledWith(playerToMove);
      expect(mockListeners[1].onPlayerMoved).toBeCalledTimes(0);
    });
    it.each(ConfigureTest(''))('should notify added listeners of player movement between super and sub map when updatePlayerRoom is called [%s]', async (testConfiguration: string) => {
      StartTest(testConfiguration);
      const newController = createTownAddListeners([mockListeners[0]]);
      const playerToMigrate = new Player('Player1');
      await newController.addPlayer(playerToMigrate);
      expect(playerToMigrate.mapId).toEqual('0');

      newController.updatePlayerMap(playerToMigrate, '1');
      newController.addTownListener(mockListeners[2]);
      newController.updatePlayerMap(playerToMigrate, '0');

      expect(mockListeners[0].onPlayerMapChange).toHaveBeenCalledWith(playerToMigrate);
      expect(mockListeners[0].onPlayerMapChange).toBeCalledTimes(2);
      expect(mockListeners[2].onPlayerMapChange).toHaveBeenCalledWith(playerToMigrate);
      expect(mockListeners[1].onPlayerMapChange).toBeCalledTimes(0);
    });
    it.each(ConfigureTest('RLEDC'))('should notify added listeners of player disconnections when destroySession is called [%s]', async (testConfiguration: string) => {
      StartTest(testConfiguration);
      const newController = createTownAddListeners([mockListeners[1], mockListeners[2]]);
      const playerToDisconnect = new Player('Player1');
      const playerSession = await newController.addPlayer(playerToDisconnect);

      newController.destroySession(playerSession);

      expect(mockListeners[1].onPlayerDisconnected).toHaveBeenCalledWith(playerToDisconnect);
      expect(mockListeners[2].onPlayerDisconnected).toHaveBeenCalledWith(playerToDisconnect);
      expect(mockListeners[0].onPlayerDisconnected).toBeCalledTimes(0);
    });
    it.each(ConfigureTest('RLENP'))('should notify added listeners of new players when addPlayer is called [%s]', async (testConfiguration: string) => {
      StartTest(testConfiguration);
      const newController = createTownAddListeners([mockListeners[1]]);
      const playerToJoin = new Player('Player1');
      const player2ToJoin = new Player('Player2');

      await newController.addPlayer(playerToJoin);
      newController.addTownListener(mockListeners[2]);
      await newController.addPlayer(player2ToJoin);

      expect(mockListeners[1].onPlayerJoined).toHaveBeenCalledWith(playerToJoin);
      expect(mockListeners[1].onPlayerJoined).toBeCalledTimes(2);
      expect(mockListeners[2].onPlayerJoined).toHaveBeenCalledWith(player2ToJoin);
      expect(mockListeners[0].onPlayerJoined).toBeCalledTimes(0);
    });
    it.each(ConfigureTest('RLEDE'))('should notify added listeners that the town is destroyed when disconnectAllPlayers is called [%s]', async (testConfiguration: string) => {
      StartTest(testConfiguration);
      const newController = createTownAddListeners([mockListeners[1], mockListeners[2]]);
      newController.disconnectAllPlayers();

      expect(mockListeners[1].onTownDestroyed).toHaveBeenCalled();
      expect(mockListeners[2].onTownDestroyed).toHaveBeenCalled();
      expect(mockListeners[0].onTownDestroyed).toBeCalledTimes(0);
    });
    it.each(ConfigureTest('RLEMVN'))('should not notify removed listeners of player movement when updatePlayerLocation is called [%s]', async (testConfiguration: string) => {
      StartTest(testConfiguration);
      const newController = createTownAddListeners([mockListeners[0]]);
      const playerToMove = new Player('Player1');
      const player2ToMove = new Player('Player2');
      await newController.addPlayer(playerToMove);
      
      newController.updatePlayerLocation(playerToMove, { x: 1, y: 1, rotation: 'front', moving: true });
      newController.addTownListener(mockListeners[2]);
      newController.removeTownListener(mockListeners[0]);
      newController.updatePlayerLocation(player2ToMove, { x: 1, y: 1, rotation: 'front', moving: true });

      expect(mockListeners[0].onPlayerMoved).toHaveBeenCalledWith(playerToMove);
      expect(mockListeners[0].onPlayerMoved).not.toHaveBeenCalledWith(player2ToMove);
      expect(mockListeners[2].onPlayerMoved).toHaveBeenCalledWith(player2ToMove);
    });
    it.each(ConfigureTest('RLEDCN'))('should not notify removed listeners of player disconnections when destroySession is called [%s]', async (testConfiguration: string) => {
      StartTest(testConfiguration);
      const newController = createTownAddListeners([mockListeners[1], mockListeners[2]]);
      const playerToDisconnect = new Player('Player1');

      const playerSession = await newController.addPlayer(playerToDisconnect);
      newController.removeTownListener(mockListeners[1]);
      newController.destroySession(playerSession);

      expect(mockListeners[1].onPlayerJoined).toHaveBeenCalledWith(playerToDisconnect);
      expect(mockListeners[1].onPlayerDisconnected).not.toHaveBeenCalledWith(playerToDisconnect);
      expect(mockListeners[2].onPlayerDisconnected).toHaveBeenCalledWith(playerToDisconnect);
    });
    it.each(ConfigureTest('RLENPN'))('should not notify removed listeners of new players when addPlayer is called [%s]', async (testConfiguration: string) => {
      StartTest(testConfiguration);
      const newController = createTownAddListeners([mockListeners[1]]);
      const playerToJoin = new Player('Player1');
      const player2ToJoin = new Player('Player2');

      await newController.addPlayer(playerToJoin);
      newController.addTownListener(mockListeners[2]);
      newController.removeTownListener(mockListeners[1]);
      await newController.addPlayer(player2ToJoin);

      expect(mockListeners[1].onPlayerJoined).toHaveBeenCalledWith(playerToJoin);
      expect(mockListeners[1].onPlayerJoined).not.toHaveBeenCalledWith(player2ToJoin);
      expect(mockListeners[2].onPlayerJoined).toHaveBeenCalledWith(player2ToJoin);
    });
    it.each(ConfigureTest('RLEDEN'))('should not notify removed listeners that the town is destroyed when disconnectAllPlayers is called [%s]', async (testConfiguration: string) => {
      StartTest(testConfiguration);
      const newController = createTownAddListeners([mockListeners[1], mockListeners[2]]);

      const playerToJoin = new Player('Player1');
      await newController.addPlayer(playerToJoin);
      newController.removeTownListener(mockListeners[1]);
      newController.disconnectAllPlayers();

      expect(mockListeners[1].onPlayerJoined).toHaveBeenCalledWith(playerToJoin);
      expect(mockListeners[1].onTownDestroyed).not.toHaveBeenCalled();
      expect(mockListeners[2].onTownDestroyed).toHaveBeenCalled();
    });
  });
  describe('townSubscriptionHandler', () => {
    /* Set up a mock socket, which you may find to be useful for testing the events that get sent back out to the client
    by the code in CoveyTownController calling socket.emit.each(ConfigureTest(''))('event', payload) - if you pass the mock socket in place of
    a real socket, you can record the invocations of emit and check them.
     */
    const mockSocket = mock<Socket>();
    /*
    Due to an unfortunate design decision of Avery's, to test the units of CoveyTownController
    that interact with the socket, we need to: 1. Get a CoveyTownController from the CoveyTownsStore, and then 2: call
    the townSubscriptionHandler method. Ripley's provided some boilerplate code for you to make this a bit easier.
     */
    let testingTown: CoveyTownController;
    beforeEach(async () => {
      const townName = `connectPlayerSocket tests ${nanoid()}`;
      // Create a new town to use for each test
      testingTown = CoveyTownsStore.getInstance().createTown(townName, false);
      // Reset the log on the mock socket
      mockReset(mockSocket);
    });
    it.each(ConfigureTest('SUBIDDC'))('should reject connections with invalid town IDs by calling disconnect [%s]', async (testConfiguration: string) => {
      StartTest(testConfiguration);
      const connectedPlayer = new Player(`test player ${nanoid()}`);
      const session = await testingTown.addPlayer(connectedPlayer);
      TestUtils.setSessionTokenAndTownID('InvalidTown', session.sessionToken, mockSocket);
      townSubscriptionHandler(mockSocket);

      expect(mockSocket.disconnect).toBeCalledWith(true);
    });
    it.each(ConfigureTest('SUBKTDC'))('should reject connections with invalid session tokens by calling disconnect [%s]', async (testConfiguration: string) => {
      StartTest(testConfiguration);
      TestUtils.setSessionTokenAndTownID(testingTown.coveyTownID, 'invalidToken', mockSocket);
      townSubscriptionHandler(mockSocket);

      expect(mockSocket.disconnect).toBeCalledWith(true);
    });
    describe('with a valid session token', () => {
      /*
        Ripley says that you might find this helper code useful: it will create a valid session, configure the mock socket
        to identify itself with those tokens, and then calls the townSubscriptionHandler on the mock socket.

        Your tests should perform operations on testingTown, and make expectations about what happens to the mock socket.
       */
      let connectedPlayer: Player;
      beforeEach(async () => {
        connectedPlayer = new Player(`test player ${nanoid()}`);
        const session = await testingTown.addPlayer(connectedPlayer);
        TestUtils.setSessionTokenAndTownID(testingTown.coveyTownID, session.sessionToken, mockSocket);
        townSubscriptionHandler(mockSocket);
      });
      it.each(ConfigureTest('SUBNP'))('should add a town listener, which should emit "newPlayer" to the socket when a player joins [%s]', async (testConfiguration: string) => {
        StartTest(testConfiguration);

        const playerToAdd = new Player('Player1');
        await testingTown.addPlayer(playerToAdd);

        expect(mockSocket.emit).toBeCalledWith('newPlayer', playerToAdd);
      });
      it.each(ConfigureTest('SUBMV'))('should add a town listener, which should emit "playerMoved" to the socket when a player moves [%s]', async (testConfiguration: string) => {
        StartTest(testConfiguration);
        testingTown.updatePlayerLocation(connectedPlayer, { x: 1, y: 1, rotation: 'front', moving: true });

        expect(mockSocket.emit).toBeCalledWith('playerMoved', connectedPlayer);
      });
      it.each(ConfigureTest('SUBDC'))('should add a town listener, which should emit "playerDisconnect" to the socket when a player disconnects [%s]', async (testConfiguration: string) => {
        StartTest(testConfiguration);
        const playerToAdd = new Player('Player1');
        const playerSession = await testingTown.addPlayer(playerToAdd);
        testingTown.destroySession(playerSession);

        expect(mockSocket.emit).toBeCalledWith('playerDisconnect', playerToAdd);
      });
      it.each(ConfigureTest('SUBRC'))('should add a town listener, which should emit "townClosing" to the socket and disconnect it when disconnectAllPlayers is called [%s]', async (testConfiguration: string) => {
        StartTest(testConfiguration);
        testingTown.disconnectAllPlayers();

        expect(mockSocket.emit).toBeCalledWith('townClosing');
        expect(mockSocket.disconnect).toBeCalled();
      });
      describe('when a socket disconnect event is fired', () => {
        /* Hint: find the on('disconnect') handler that CoveyTownController registers on the socket, and then
           call that handler directly to simulate a real socket disconnecting.
           */
        it.each(ConfigureTest('SUBDCRL'))('should remove the town listener for that socket, and stop sending events to it [%s]', async (testConfiguration: string) => {
          StartTest(testConfiguration);
          const onCalls = mockSocket.on.mock.calls;
          const onDisconnect = onCalls[0];
          const onDisconnectFunction = onDisconnect[1];

          testingTown.updatePlayerLocation(connectedPlayer, { x: 1, y: 1, rotation: 'front', moving: true });
          expect(mockSocket.emit).toBeCalledWith('playerMoved', connectedPlayer);

          onDisconnectFunction();

          testingTown.updatePlayerLocation(connectedPlayer, { x: 1, y: 1, rotation: 'front', moving: true });
          expect(mockSocket.emit).toBeCalledTimes(1);
        });
        it.each(ConfigureTest('SUBDCSE'))('should destroy the session corresponding to that socket [%s]', async (testConfiguration: string) => {
          StartTest(testConfiguration);
          const onCalls = mockSocket.on.mock.calls;
          const onDisconnect = onCalls[0];
          const onDisconnectFunction = onDisconnect[1];

          let playerIds = testingTown.players.map((player) => player.id);
          expect(playerIds).toContain(connectedPlayer.id);

          onDisconnectFunction();
          
          playerIds = testingTown.players.map((player) => player.id);
          expect(playerIds).not.toContain(connectedPlayer.id);
        });
      });
      it.each(ConfigureTest('SUBMVL'))('should forward playerMovement events from the socket to subscribed listeners [%s]', async (testConfiguration: string) => {
        StartTest(testConfiguration);
        const mockTownListerner = mock<CoveyTownListener>();
        testingTown.addTownListener(mockTownListerner);
        const onCalls = mockSocket.on.mock.calls;
        const onMovement = onCalls[1];
        const onMovementFunction = onMovement[1];

        onMovementFunction({ x: 1, y: 1, rotation: 'front', moving: true });

        expect(mockTownListerner.onPlayerMoved).toBeCalledWith(connectedPlayer);
      });
    });
  });
});
