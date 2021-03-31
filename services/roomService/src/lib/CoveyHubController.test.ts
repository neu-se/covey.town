import {nanoid} from 'nanoid';
import {mock, mockReset} from 'jest-mock-extended';
import {Socket} from 'socket.io';
import TwilioVideo from './TwilioVideo';
import Player from '../types/Player';
import CoveyHubController from './CoveyHubController';
import CoveyHubListener from '../types/CoveyHubListener';
import {UserLocation} from '../CoveyTypes';
import PlayerSession from '../types/PlayerSession';
import {hubSubscriptionHandler} from '../requestHandlers/CoveyHubRequestHandlers';
import CoveyHubStore from './CoveyHubStore';
import * as TestUtils from '../client/TestUtils';

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
describe('town listeners and events', () => {
  let testingTown: CoveyHubController;
  const mockListeners = [mock<CoveyHubListener>(),
    mock<CoveyHubListener>(),
    mock<CoveyHubListener>()];
  beforeEach(() => {
    const hubName = `town listeners and events tests ${nanoid()}`;
    testingTown = new CoveyHubController(hubName, false);
    mockListeners.forEach(mockReset);
  });
  it('should notify added listeners of player movement when updatePlayerLocation is called', async () => {
    const player = new Player('test player');
    await testingTown.addPlayer(player);
    const newLocation = generateTestLocation();
    mockListeners.forEach(listener => testingTown.addHubListener(listener));
    testingTown.updatePlayerLocation(player, newLocation);
    mockListeners.forEach(listener => expect(listener.onPlayerMoved).toBeCalledWith(player));
  });
  it('should notify added listeners of player disconnections when destroySession is called', async () => {
    const player = new Player('test player');
    const session = await testingTown.addPlayer(player);

    mockListeners.forEach(listener => testingTown.addHubListener(listener));
    testingTown.destroySession(session);
    mockListeners.forEach(listener => expect(listener.onPlayerDisconnected).toBeCalledWith(player));
  });
  it('should notify added listeners of new players when addPlayer is called', async () => {
    mockListeners.forEach(listener => testingTown.addHubListener(listener));

    const player = new Player('test player');
    await testingTown.addPlayer(player);
    mockListeners.forEach(listener => expect(listener.onPlayerJoined).toBeCalledWith(player));
  });
  it('should notify added listeners that the town is destroyed when disconnectAllPlayers is called', async () => {
    const player = new Player('test player');
    await testingTown.addPlayer(player);

    mockListeners.forEach(listener => testingTown.addHubListener(listener));
    testingTown.disconnectAllPlayers();
    mockListeners.forEach(listener => expect(listener.onHubDestroyed).toBeCalled());

  });
  it('should not notify removed listeners of player movement when updatePlayerLocation is called', async () => {
    const player = new Player('test player');
    await testingTown.addPlayer(player);

    mockListeners.forEach(listener => testingTown.addHubListener(listener));
    const newLocation = generateTestLocation();
    const listenerRemoved = mockListeners[1];
    testingTown.removeHubListener(listenerRemoved);
    testingTown.updatePlayerLocation(player, newLocation);
    expect(listenerRemoved.onPlayerMoved).not.toBeCalled();
  });
  it('should not notify removed listeners of player disconnections when destroySession is called', async () => {
    const player = new Player('test player');
    const session = await testingTown.addPlayer(player);

    mockListeners.forEach(listener => testingTown.addHubListener(listener));
    const listenerRemoved = mockListeners[1];
    testingTown.removeHubListener(listenerRemoved);
    testingTown.destroySession(session);
    expect(listenerRemoved.onPlayerDisconnected).not.toBeCalled();

  });
  it('should not notify removed listeners of new players when addPlayer is called', async () => {
    const player = new Player('test player');

    mockListeners.forEach(listener => testingTown.addHubListener(listener));
    const listenerRemoved = mockListeners[1];
    testingTown.removeHubListener(listenerRemoved);
    const session = await testingTown.addPlayer(player);
    testingTown.destroySession(session);
    expect(listenerRemoved.onPlayerJoined).not.toBeCalled();
  });

  it('should not notify removed listeners that the town is destroyed when disconnectAllPlayers is called', async () => {
    const player = new Player('test player');
    await testingTown.addPlayer(player);

    mockListeners.forEach(listener => testingTown.addHubListener(listener));
    const listenerRemoved = mockListeners[1];
    testingTown.removeHubListener(listenerRemoved);
    testingTown.disconnectAllPlayers();
    expect(listenerRemoved.onHubDestroyed).not.toBeCalled();

  });
});
describe('townSubscriptionHandler', () => {
  const mockSocket = mock<Socket>();
  let testingTown: CoveyHubController;
  let player: Player;
  let session: PlayerSession;
  beforeEach(async () => {
    const townName = `connectPlayerSocket tests ${nanoid()}`;
    testingTown = CoveyHubStore.getInstance().createHub(townName, false);
    mockReset(mockSocket);
    player = new Player('test player');
    session = await testingTown.addPlayer(player);
  });
  describe('with a valid session token', () => {
    it('should add a town listener, which should emit "newPlayer" to the socket when a player joins', async () => {
      TestUtils.setSessionTokenAndTownID(testingTown.coveyHubID, session.sessionToken, mockSocket);
      hubSubscriptionHandler(mockSocket);
      await testingTown.addPlayer(player);
      expect(mockSocket.emit).toBeCalledWith('newPlayer', player);
    });
    it('should add a town listener, which should emit "playerMoved" to the socket when a player moves', async () => {
      TestUtils.setSessionTokenAndTownID(testingTown.coveyHubID, session.sessionToken, mockSocket);
      hubSubscriptionHandler(mockSocket);
      testingTown.updatePlayerLocation(player, generateTestLocation());
      expect(mockSocket.emit).toBeCalledWith('playerMoved', player);

    });
    it('should add a town listener, which should emit "playerDisconnect" to the socket when a player disconnects', async () => {
      TestUtils.setSessionTokenAndTownID(testingTown.coveyHubID, session.sessionToken, mockSocket);
      hubSubscriptionHandler(mockSocket);
      testingTown.destroySession(session);
      expect(mockSocket.emit).toBeCalledWith('playerDisconnect', player);
    });
    it('should add a town listener, which should emit "townClosing" to the socket and disconnect it when disconnectAllPlayers is called', async () => {
      TestUtils.setSessionTokenAndTownID(testingTown.coveyHubID, session.sessionToken, mockSocket);
      hubSubscriptionHandler(mockSocket);
      testingTown.disconnectAllPlayers();
      expect(mockSocket.emit).toBeCalledWith('townClosing');
      expect(mockSocket.disconnect).toBeCalledWith(true);
    });
    describe('when a socket disconnect event is fired', () => {
      it('should remove the town listener for that socket, and stop sending events to it', async () => {
        TestUtils.setSessionTokenAndTownID(testingTown.coveyHubID, session.sessionToken, mockSocket);
        hubSubscriptionHandler(mockSocket);

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
        TestUtils.setSessionTokenAndTownID(testingTown.coveyHubID, session.sessionToken, mockSocket);
        hubSubscriptionHandler(mockSocket);

        // find the 'disconnect' event handler for the socket, which should have been registered after the socket was connected
        const disconnectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect');
        if (disconnectHandler && disconnectHandler[1]) {
          disconnectHandler[1]();
          mockReset(mockSocket);
          TestUtils.setSessionTokenAndTownID(testingTown.coveyHubID, session.sessionToken, mockSocket);
          hubSubscriptionHandler(mockSocket);
          expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
        } else {
          fail('No disconnect handler registered');
        }

      });
    });
    it('should forward playerMovement events from the socket to subscribed listeners', async () => {
      TestUtils.setSessionTokenAndTownID(testingTown.coveyHubID, session.sessionToken, mockSocket);
      hubSubscriptionHandler(mockSocket);
      const mockListener = mock<CoveyHubListener>();
      testingTown.addHubListener(mockListener);
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
