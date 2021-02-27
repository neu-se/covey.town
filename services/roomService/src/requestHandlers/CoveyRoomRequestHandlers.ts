import assert from 'assert';
import { Socket } from 'socket.io';
import Player from '../types/Player';
import { CoveyRoomList, UserLocation } from '../CoveyTypes';
import CoveyRoomListener from '../types/CoveyRoomListener';
import CoveyRoomsStore from '../lib/CoveyRoomsStore';

/**
 * The format of a request to join a Town in Covey.Town, as dispatched by the server middleware
 */
export interface TownJoinRequest {
  /** userName of the player that would like to join * */
  userName: string;
  /** ID of the room that the player would like to join * */
  coveyRoomID: string;
}

/**
 * The format of a response to join a Town in Covey.Town, as returned by the handler to the server
 * middleware
 */
export interface TownJoinResponse {
  /** Unique ID that represents this player * */
  coveyUserID: string;
  /** Secret token that this player should use to authenticate
   * in future requests to this service * */
  coveySessionToken: string;
  /** Secret token that this player should use to authenticate
   * in future requests to the video service * */
  providerVideoToken: string;
  /** List of players currently in this room * */
  currentPlayers: Player[];
  /** Friendly name of this room * */
  friendlyName: string;
  /** Is this a private room? * */
  isPubliclyListed: boolean;
}

/**
 * Payload sent by client to create a Town in Covey.Town
 */
export interface TownCreateRequest {
  friendlyName: string;
  isPubliclyListed: boolean;
}

/**
 * Response from the server for a Town create request
 */
export interface TownCreateResponse {
  coveyRoomID: string;
  coveyRoomPassword: string;
}

/**
 * Response from the server for a Town list request
 */
export interface TownListResponse {
  rooms: CoveyRoomList;
}

/**
 * Payload sent by the client to delete a Town
 */
export interface TownDeleteRequest {
  coveyRoomID: string;
  coveyRoomPassword: string;
}

/**
 * Payload sent by the client to update a Town.
 * N.B., JavaScript is terrible, so:
 * if(!isPubliclyListed) -> evaluates to true if the value is false OR undefined, use ===
 */
export interface TownUpdateRequest {
  coveyRoomID: string;
  coveyRoomPassword: string;
  friendlyName?: string;
  isPubliclyListed?: boolean;
}

/**
 * Envelope that wraps any response from the server
 */
export interface ResponseEnvelope<T> {
  isOK: boolean;
  message?: string;
  response?: T;
}

/**
 * A handler to process a player's request to join a room. The flow is:
 *  1. Client makes a RoomJoinRequest, this handler is executed
 *  2. Client uses the sessionToken returned by this handler to make a subscription to the room,
 *  @see roomSubscriptionHandler for the code that handles that request.
 *
 * @param requestData an object representing the player's request
 */
export async function roomJoinHandler(requestData: TownJoinRequest): Promise<ResponseEnvelope<TownJoinResponse>> {
  const roomsStore = CoveyRoomsStore.getInstance();

  const coveyRoomController = roomsStore.getControllerForRoom(requestData.coveyRoomID);
  if (!coveyRoomController) {
    return {
      isOK: false,
      message: 'Error: No such room',
    };
  }
  const newPlayer = new Player(requestData.userName);
  const newSession = await coveyRoomController.addPlayer(newPlayer);
  assert(newSession.videoToken);
  return {
    isOK: true,
    response: {
      coveyUserID: newPlayer.id,
      coveySessionToken: newSession.sessionToken,
      providerVideoToken: newSession.videoToken,
      currentPlayers: coveyRoomController.players,
      friendlyName: coveyRoomController.friendlyName,
      isPubliclyListed: coveyRoomController.isPubliclyListed,
    },
  };
}

export async function roomListHandler(): Promise<ResponseEnvelope<TownListResponse>> {
  const roomsStore = CoveyRoomsStore.getInstance();
  return {
    isOK: true,
    response: { rooms: roomsStore.getRooms() },
  };
}

export async function roomCreateHandler(requestData: TownCreateRequest): Promise<ResponseEnvelope<TownCreateResponse>> {
  const roomsStore = CoveyRoomsStore.getInstance();
  if (requestData.friendlyName.length === 0) {
    return {
      isOK: false,
      message: 'FriendlyName must be specified',
    };
  }
  const newRoom = roomsStore.createRoom(requestData.friendlyName, requestData.isPubliclyListed);
  return {
    isOK: true,
    response: {
      coveyRoomID: newRoom.coveyRoomID,
      coveyRoomPassword: newRoom.roomUpdatePassword,
    },
  };
}

export async function roomDeleteHandler(requestData: TownDeleteRequest): Promise<ResponseEnvelope<Record<string, null>>> {
  const roomsStore = CoveyRoomsStore.getInstance();
  const success = roomsStore.deleteRoom(requestData.coveyRoomID, requestData.coveyRoomPassword);
  return {
    isOK: success,
    response: {},
    message: !success ? 'Invalid password. Please double check your town update password.' : undefined,
  };
}

export async function roomUpdateHandler(requestData: TownUpdateRequest): Promise<ResponseEnvelope<Record<string, null>>> {
  const roomsStore = CoveyRoomsStore.getInstance();
  const success = roomsStore.updateRoom(requestData.coveyRoomID, requestData.coveyRoomPassword, requestData.friendlyName, requestData.isPubliclyListed);
  return {
    isOK: success,
    response: {},
    message: !success ? 'Invalid password or update values specified. Please double check your town update password.' : undefined,
  };

}

/**
 * An adapter between CoveyRoomController's event interface (CoveyRoomListener)
 * and the low-level network communication protocol
 *
 * @param socket the Socket object that we will use to communicate with the player
 */
function roomSocketAdapter(socket: Socket): CoveyRoomListener {
  return {
    onPlayerMoved(movedPlayer: Player) {
      socket.emit('playerMoved', movedPlayer);
    },
    onPlayerDisconnected(removedPlayer: Player) {
      socket.emit('playerDisconnect', removedPlayer);
    },
    onPlayerJoined(newPlayer: Player) {
      socket.emit('newPlayer', newPlayer);
    },
    onRoomDestroyed() {
      socket.emit('roomClosing');
      socket.disconnect(true);
    },
  };
}

/**
 * A handler to process a remote player's subscription to updates for a room
 *
 * @param socket the Socket object that we will use to communicate with the player
 */
export function roomSubscriptionHandler(socket: Socket): void {
  // Parse the client's session token from the connection
  // For each player, the session token should be the same string returned by joinRoomHandler
  const { token, coveyRoomID } = socket.handshake.auth as { token: string; coveyRoomID: string };

  // Right now, we only support a single room, so there is only a single CoveyRoomController
  const roomController = CoveyRoomsStore.getInstance()
    .getControllerForRoom(coveyRoomID);

  // Retrieve our metadata about this player from the RoomController
  const s = roomController?.getSessionByToken(token);
  if (!s || !roomController) {
    // No valid session exists for this token, hence this client's connection should be terminated
    socket.disconnect(true);
    return;
  }

  // Create an adapter that will translate events from the CoveyRoomController into
  // events that the socket protocol knows about
  const listener = roomSocketAdapter(socket);
  roomController.addRoomListener(listener);

  // Register an event listener for the client socket: if the client disconnects,
  // clean up our listener adapter, and then let the CoveyRoomController know that the
  // player's session is disconnected
  socket.on('disconnect', () => {
    roomController.removeRoomListener(listener);
    roomController.destroySession(s);
  });

  // Register an event listener for the client socket: if the client updates their
  // location, inform the CoveyRoomController
  socket.on('playerMovement', (movementData: UserLocation) => {
    roomController.updatePlayerLocation(s.player, movementData);
  });
}
