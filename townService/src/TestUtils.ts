import { BroadcastOperator } from 'socket.io';

import { mock, mockDeep, MockProxy } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { SocketReservedEventsMap } from 'socket.io/dist/socket';
import {
  EventNames,
  EventParams,
  ReservedOrUserEventNames,
  ReservedOrUserListener,
  TypedEventBroadcaster,
} from 'socket.io/dist/typed-events';
import Player from './lib/Player';
import {
  BoundingBox,
  ClientToServerEvents,
  ConversationArea,
  CoveyTownSocket,
  Direction,
  Interactable,
  PlayerLocation,
  ServerToClientEvents,
  SocketData,
  ViewingArea,
} from './types/CoveyTownSocket';

/**
 * Create a new conversation area using some random defaults
 * @param params
 * @returns
 */
export function createConversationForTesting(params?: {
  conversationID?: string;
  conversationTopic?: string;
  boundingBox?: BoundingBox;
}): ConversationArea {
  return {
    id: params?.conversationID || nanoid(),
    occupantsByID: [],
    topic: params?.conversationTopic || nanoid(),
  };
}

export function defaultLocation(): PlayerLocation {
  return { x: 0, y: 0, moving: false, rotation: 'front', interactableID: undefined };
}

export type ClientEventTypes = ReservedOrUserEventNames<
  SocketReservedEventsMap,
  ClientToServerEvents
>;

/**
 * Resets all recorded mock calls for the given emitter (optionally only for a given event name)
 * @param mockEmitter
 * @param eventName
 */
export function clearEmittedEvents<Ev extends EventNames<ServerToClientEvents>>(
  mockEmitter: MockProxy<TypedEventBroadcaster<ServerToClientEvents>>,
  eventName?: Ev,
) {
  if (!eventName) {
    mockEmitter.emit.mock.calls = [];
  } else {
    mockEmitter.emit.mock.calls = mockEmitter.emit.mock.calls.filter(
      eachCall => eachCall[0] !== eventName,
    );
  }
}
/**
 * Given a mock emitter, retrieve the last event that was emitted of a given type, optionally skipping the most recent N events emitted
 *
 * @param emitter the emitter
 * @param eventName name of the event to use (@see ServerToClientEvents)
 * @param howFarBack optionally, how many recent events to skip, default to 0 (find most recent event emit)
 * @returns the event data that was emitted
 */
export function getLastEmittedEvent<Ev extends EventNames<ServerToClientEvents>>(
  emitter: MockProxy<TypedEventBroadcaster<ServerToClientEvents>>,
  eventName: Ev,
  howFarBack = 0,
): EventParams<ServerToClientEvents, Ev>[0] {
  const { calls } = emitter.emit.mock;
  let nCallsToSkip = howFarBack;
  for (let i = calls.length - 1; i >= 0; i--) {
    if (calls[i][0] === eventName) {
      if (nCallsToSkip === 0) {
        const param = calls[i][1];
        return param;
      }

      nCallsToSkip--;
    }
  }
  throw new Error(`No ${eventName} could be found as emitted on this socket`);
}

/**
 * Given a player that has been mocked, retrieve the session token that had been passed to it when it was added to the town
 * @param player
 * @returns
 */
export function extractSessionToken(player: MockedPlayer): string {
  return getLastEmittedEvent(player.socket, 'initialize').sessionToken;
}

/**
 * Given a mocked CoveyTownSocket, return the first event listener that was registered for a given event
 * @param mockSocket
 * @param eventName Name of a client to server event, @see ClientToServerEvents
 * @returns the corresponding event handler for that event name
 * @throws Error if no handler was registered
 */
export function getEventListener<
  Ev extends ReservedOrUserEventNames<SocketReservedEventsMap, ClientToServerEvents>,
>(
  mockSocket: MockProxy<CoveyTownSocket>,
  eventName: Ev,
): ReservedOrUserListener<SocketReservedEventsMap, ClientToServerEvents, Ev> {
  const ret = mockSocket.on.mock.calls.find(eachCall => eachCall[0] === eventName);
  if (ret) {
    const param = ret[1];
    if (param) {
      return param as unknown as ReservedOrUserListener<
        SocketReservedEventsMap,
        ClientToServerEvents,
        Ev
      >;
    }
  }
  throw new Error(`No event listener found for event ${eventName}`);
}

export class MockedPlayer {
  socket: MockProxy<CoveyTownSocket>;

  socketToRoomMock: MockProxy<TypedEventBroadcaster<ServerToClientEvents>>;

  userName: string;

  townID: string;

  player: Player | undefined;

  constructor(
    socket: MockProxy<CoveyTownSocket>,
    socketToRoomMock: MockProxy<TypedEventBroadcaster<ServerToClientEvents>>,
    userName: string,
    townID: string,
    player: Player | undefined,
  ) {
    this.socket = socket;
    this.socketToRoomMock = socketToRoomMock;
    this.userName = userName;
    this.townID = townID;
    this.player = player;
  }

  moveTo(x: number, y: number, rotation: Direction = 'front', moving = false): void {
    const onMovementListener = getEventListener(this.socket, 'playerMovement');
    onMovementListener({ x, y, rotation, moving });
  }
}

/**
 * Create a new mock player for a given town, NOT adding it to the town, but constructing the appropriate mock objects
 * so that we can later check various properties of the player
 *
 * @param townID
 * @returns
 */
export function mockPlayer(townID: string): MockedPlayer {
  const socket = mockDeep<CoveyTownSocket>();
  const userName = nanoid();
  socket.handshake.auth = { userName, townID };
  const socketToRoomMock = mock<BroadcastOperator<ServerToClientEvents, SocketData>>();
  socket.to.mockImplementation((room: string | string[]) => {
    if (townID === room) {
      return socketToRoomMock;
    }
    throw new Error(`Tried to broadcast to ${room} but this player is in ${townID}`);
  });
  return new MockedPlayer(socket, socketToRoomMock, userName, townID, undefined);
}

/**
 * Assert that two arrays contain the same members (by strict === equality), allowing them to appear in different orders
 * @param actual
 * @param expected
 */
export function expectArraysToContainSameMembers<T>(actual: T[], expected: T[]): void {
  expect(actual.length).toBe(expected.length);
  expected.forEach(expectedVal =>
    expect(actual.find(actualVal => actualVal === expectedVal)).toBeDefined(),
  );
}

export function isViewingArea(interactable: Interactable): interactable is ViewingArea {
  return 'isPlaying' in interactable;
}

export function isConversationArea(interactable: Interactable): interactable is ConversationArea {
  return 'topic' in interactable;
}
