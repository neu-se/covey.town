import assert from 'assert';
import { Socket } from 'socket.io';
import Player from '../types/Player';
import { CoveyRoomList, UserLocation } from '../CoveyTypes';
import CoveyRoomListener from '../types/CoveyRoomListener';
import CoveyRoomsStore from '../lib/CoveyRoomsStore';
import { removeThisFunctionCallWhenYouImplementThis } from '../Utils';

/**
 * The format of a request to join a CoveyRoom, as dispatched by the server middleware
 */
export interface RoomJoinRequest {
  /** userName of the player that would like to join * */
  userName: string;
  /** ID of the room that the player would like to join * */
  coveyRoomID: string;
}

/**
 * The format of a response to join a CoveyRoom, as returned by the handler to the server middleware
 */
export interface RoomJoinResponse {
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
}

/**
 * Payload sent by client to create a room
 */
export interface RoomCreateRequest {
  friendlyName: string;
  isPubliclyListed: boolean;
}

/**
 * Response from the server for a room create request
 */
export interface RoomCreateResponse {
  coveyRoomID: string;
  coveyRoomPassword: string;
}

/**
 * Response from the server for a room list request
 */
export interface RoomListResponse {
  rooms: CoveyRoomList;
}

/**
 * Payload sent by the client to delete a room
 */
export interface RoomDeleteRequest {
  coveyRoomID: string;
  coveyRoomPassword: string;
}

/**
 * Payload sent by the client to update a room.
 * N.B., JavaScript is terrible, so:
 * if(!isPubliclyListed) -> evaluates to true if the value is false OR undefined, use ===
 */
export interface RoomUpdateRequest {
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
export async function roomJoinHandler(requestData: RoomJoinRequest): Promise<ResponseEnvelope<RoomJoinResponse>> {
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
    },
  };
}

/**
 * List all of the rooms that are set to "publicly visible"
 *
 * The `isOK` field on the envelope must be set to `true` in all cases
 * (this function can not return an error)
 *
 * @see CoveyRoomsStore.getRooms - which will return the list of rooms
 *
 */
export async function roomListHandler(): Promise<ResponseEnvelope<RoomListResponse>> {
  // TODO, remove this line when you implement this function
  throw removeThisFunctionCallWhenYouImplementThis();
}

/**
 * Create a new room and returns its ID and password.
 *
 * Sets the `isOK` field on the envelope to `false` if the `friendlyName` specified is empty
 * (a 0-length string), and also sets the `message` envelope field with a descriptive error.
 *
 * Otherwise, sets the `isOK` field on the envelope to `true` if the request succeeds, and returns
 * the room information inside of the response envelope.
 *
 * @see CoveyRoomsStore.createRoom - which will create and track the new room
 *
 * @param requestData the "friendly name" to assign this room, and its publicly visibility
 *
 */
export async function roomCreateHandler(requestData: RoomCreateRequest): Promise<ResponseEnvelope<RoomCreateResponse>> {
  // TODO, remove this line when you implement this function
  throw removeThisFunctionCallWhenYouImplementThis(requestData);
}

/**
 * Deletes a room.
 *
 * Sets the `isOK` field on the envelope to `true` if the room exists, password matches, and room
 * is deleted. Sets the `isOK` field on the envelope to `false` and the `message` field to "Invalid
 * Request" if the room does not exist, or password does not match.
 *
 *
 * Does not return any other data inside of the envelope
 *
 * @see CoveyRoomsStore.deleteRoom - which will delete the room from its store
 *
 * @param requestData the requested room ID to delete and the password specified by the client
 */
export async function roomDeleteHandler(requestData: RoomDeleteRequest): Promise<ResponseEnvelope<Record<string, null>>> {
  // TODO, remove this line when you implement this function
  throw removeThisFunctionCallWhenYouImplementThis(requestData);
}

/**
 * Updates a room's friendlyName and/or public visibility.
 *
 * Rejects the request (by setting `isOK` field on the envelope to `false`) if the request is to
 * update the `friendlyName` to an empty string.
 *
 * Sets the `isOK` field on the envelope to `true` if the room exists, password matches, and room
 * is updated. Sets the `isOK` field on the envelope to `false` and the `message` field to "Invalid
 * Request" if the room does not exist, or password does not match.
 *
 * @see CoveyRoomsStore.updateRoom - which will update the room's data
 *
 * @param requestData the update request. This handler should only update fields of the room only
 *   if the password supplied in the request matches the password on record.
 */
export async function roomUpdateHandler(requestData: RoomUpdateRequest): Promise<ResponseEnvelope<Record<string, null>>> {
  // TODO, remove this line when you implement this function
  throw removeThisFunctionCallWhenYouImplementThis(requestData);
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
