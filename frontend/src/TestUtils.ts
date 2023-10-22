import { ReservedOrUserListener } from '@socket.io/component-emitter';
import { mock, MockProxy } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import ConversationAreaController from './classes/interactable/ConversationAreaController';
import PlayerController from './classes/PlayerController';
import TownController, { TownEvents } from './classes/TownController';
import ViewingAreaController from './classes/interactable/ViewingAreaController';
import { TownsService } from './generated/client';
import {
  ConversationArea,
  CoveyTownSocket,
  ServerToClientEvents,
  TownJoinResponse,
  ViewingArea,
} from './types/CoveyTownSocket';

//These types copied from socket.io server library so that we don't have to depend on the whole thing to have type-safe tests.
type SocketReservedEventsMap = {
  disconnect: (reason: string) => void;
  disconnecting: (reason: string) => void;
  error: (err: Error) => void;
};
interface EventsMap {
  [event: string]: any;
}
export type EventNames<Map extends EventsMap> = keyof Map & (string | symbol);
export type EventParams<Map extends EventsMap, Ev extends EventNames<Map>> = Parameters<Map[Ev]>;
type ReservedOrUserEventNames<ReservedEventsMap extends EventsMap, UserEvents extends EventsMap> =
  | EventNames<ReservedEventsMap>
  | EventNames<UserEvents>;

/**
 * All events that can be received by the CoveyTownSocket - both the reserved events from the library (e.g. "disconnect"), and also
 * the events defined in our protocol (@see ServerToClientEvents)
 */
export type ReceivedEvent = ReservedOrUserEventNames<SocketReservedEventsMap, ServerToClientEvents>;
/**
 * All event listeners that can be registered for the CoveyTownSocket. This type is parameterized over the
 * specific event name.
 */
export type ReceivedEventListener<EventName extends ReceivedEvent> = ReservedOrUserListener<
  SocketReservedEventsMap,
  ServerToClientEvents,
  EventName
>;

/**
 * The type of the first parameter passed to a socket event
 *
 * Due to TS-41778 it is a pain to make this work for reserved events too (e.g. disconnect), so this will only work for our user-defined events,
 * but this is probably OK anyway because those are what we most want to test! https://github.com/microsoft/TypeScript/issues/41778
 */
export type ReceivedEventParameter<EventName extends EventNames<ServerToClientEvents>> =
  EventParams<ServerToClientEvents, EventName>[0];

/**
 * Given a mocked CoveyTownSocket, return the first event listener that was registered for a given event
 * @param mockSocket
 * @param eventName Name of a client to server event, @see ClientToServerEvents
 * @returns the corresponding event handler for that event name
 * @throws Error if no handler was registered
 */
export function getEventListener<Ev extends ReceivedEvent>(
  mockSocket: MockProxy<CoveyTownSocket>,
  eventName: Ev,
): ReceivedEventListener<Ev> {
  const ret = mockSocket.on.mock.calls.find(eachCall => eachCall[0] === eventName);
  if (ret) {
    const param = ret[1];
    if (param) {
      return param as unknown as ReservedOrUserListener<
        SocketReservedEventsMap,
        ServerToClientEvents,
        Ev
      >;
    }
  }
  throw new Error(`No event listener found for event ${eventName}`);
}

/**
 * Properties of the TownController that can be overriden for mock instances upon creation,
 * @see mockTownController
 */
type MockedTownControllerProperties = {
  friendlyName?: string;
  townID?: string;
  providerVideoToken?: string;
  townsService?: TownsService;
  townIsPubliclyListed?: boolean;
  players?: PlayerController[];
  conversationAreas?: ConversationAreaController[];
  viewingAreas?: ViewingAreaController[];
};
export function mockTownController({
  friendlyName,
  townID,
  providerVideoToken,
  townsService,
  townIsPubliclyListed,
  players,
  conversationAreas,
  viewingAreas,
}: MockedTownControllerProperties) {
  const mockedController = mock<TownController>();
  if (friendlyName) {
    Object.defineProperty(mockedController, 'friendlyName', { value: friendlyName });
  }
  if (townID) {
    Object.defineProperty(mockedController, 'townID', { value: townID });
  }
  if (providerVideoToken) {
    Object.defineProperty(mockedController, 'providerVideoToken', { value: providerVideoToken });
  }
  if (townsService) {
    Object.defineProperty(mockedController, 'townsService', { value: townsService });
  }
  if (townIsPubliclyListed !== undefined) {
    Object.defineProperty(mockedController, 'townIsPubliclyListed', {
      value: townIsPubliclyListed,
    });
  }
  if (players) {
    Object.defineProperty(mockedController, 'players', { value: players });
  }
  if (conversationAreas) {
    Object.defineProperty(mockedController, 'interactableAreas', { value: conversationAreas });
    Object.defineProperty(mockedController, 'conversationAreas', { value: conversationAreas });
  }
  if (viewingAreas) {
    Object.defineProperty(mockedController, 'interactableAreas', { value: viewingAreas });
    Object.defineProperty(mockedController, 'viewingAreas', { value: conversationAreas });
  }
  return mockedController;
}

/**
 * Simulates the successful connection of a TownController to the townsService. This
 * asynchronous method will dispatch an "initialize" event to the mock town controller upon connection,
 * allowing tests to observe the behavior of the TownController in isolation from a server.
 *
 * @param testController the town controller to connect
 * @param mockSocket the mock socket instance that the town controller will connect
 * @param townJoinResponse the initial data that was passed to the town controller
 */
export async function mockTownControllerConnection(
  testController: TownController,
  mockSocket: MockProxy<CoveyTownSocket>,
  townJoinResponse?: TownJoinResponse,
): Promise<TownJoinResponse> {
  let responseToSendController: TownJoinResponse;
  if (townJoinResponse) {
    responseToSendController = townJoinResponse;
  } else {
    const ourUserID = nanoid();
    responseToSendController = {
      interactables: [],
      currentPlayers: [
        {
          id: ourUserID,
          userName: testController.userName,
          location: { moving: false, x: 0, y: 0, rotation: 'back' },
        },
      ],
      friendlyName: nanoid(),
      isPubliclyListed: true,
      providerVideoToken: nanoid(),
      sessionToken: nanoid(),
      userID: ourUserID,
    };
    responseToSendController.interactables.push({
      id: nanoid(),
      topic: undefined,
      occupants: [],
      type: 'ConversationArea',
    } as ConversationArea);
    for (let i = 0; i < 10; i++) {
      const playerID = nanoid();
      responseToSendController.currentPlayers.push({
        id: playerID,
        userName: nanoid(),
        location: { moving: false, x: 0, y: 0, rotation: 'back' },
      });
      responseToSendController.interactables.push({
        id: nanoid(),
        topic: nanoid(),
        occupants: [playerID],
        type: 'ConversationArea',
      } as ConversationArea);
      responseToSendController.interactables.push({
        id: nanoid(),
        video: nanoid(),
        elapsedTimeSec: 0,
        isPlaying: false,
        occupants: [],
        type: 'ViewingArea',
      } as ViewingArea);
    }
  }
  mockSocket.on.mockImplementationOnce((eventName, eventListener) => {
    if (eventName === 'initialize') {
      const listener = eventListener as (initData: TownJoinResponse) => void;
      listener(responseToSendController);
    }
    return mockSocket;
  });
  await testController.connect();
  return responseToSendController;
}

export function unorderedEquality<T>(a1: T[], a2: T[]) {
  if (a1.length !== a2.length) return false;
  return !a1.some((val, idx) => val !== a2[idx]);
}

/**
 * Given a mocked TownController, retrieve the first event listener for a type (and assert that there are no more than 1)
 * @param eventName Name of a TownEvent - @see TownEvents
 * @returns the corresponding event handler for that event name
 * @throws Error if no handler was registered
 */
export function getTownEventListener<Ev extends EventNames<TownEvents>>(
  townController: MockProxy<TownController>,
  eventName: Ev,
): TownEvents[Ev] {
  let ret = townController.addListener.mock.calls.find(eachCall => eachCall[0] === eventName);
  if (!ret) {
    ret = townController.on.mock.calls.find(eachCall => eachCall[0] === eventName);
  }
  if (ret) {
    const param = ret[1];
    if (param) {
      return param as unknown as TownEvents[Ev];
    }
  }
  throw new Error(`No event listener found for event ${eventName}`);
}
