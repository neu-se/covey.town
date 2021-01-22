import assert from 'assert';
import { Socket } from 'socket.io';
import CoveyRoomController from '../lib/CoveyRoomController';
import Player from '../types/Player';
import { UserLocation } from '../CoveyTypes';
import CoveyRoomListener from '../types/CoveyRoomListener';

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
  /** An error message describing any error that occurred, or "ok" * */
  message: string;
}

/**
 * A handler to process a player's request to join a room. The flow is:
 *  1. Client makes a RoomJoinRequest, this handler is executed
 *  2. Client uses the sessionToken returned by this handler to make a subscription to the room,
 *  @see roomSubscriptionHandler for the code that handles that request.
 *
 * @param requestData an object representing the player's request
 */
export async function roomJoinHandler(requestData: RoomJoinRequest): Promise<RoomJoinResponse> {
  const coveyRoomController = CoveyRoomController.getInstance();
  const newPlayer = new Player(requestData.userName);
  const newSession = await coveyRoomController.addPlayer(newPlayer);
  assert(newSession.videoToken);
  return {
    coveyUserID: newPlayer.id,
    coveySessionToken: newSession.sessionToken,
    providerVideoToken: newSession.videoToken,
    currentPlayers: coveyRoomController.players,
    message: 'ok',
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
  //
  // The eslint-disable is here because the coveyRoomID is currently unused (and you'll use it for
  // part 3!)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { token, coveyRoomID } = socket.handshake.auth as { token: string; coveyRoomID: string };
  // TODO: use coveyRoomID

  // Right now, we only support a single room, so there is only a single CoveyRoomController
  const controller1 = CoveyRoomController.getInstance();

  // Retrieve our metadata about this player from the RoomController
  const s = controller1.getSessionByToken(token);
  if (!s) {
    // No valid session exists for this token, hence this client's connection should be terminated
    socket.disconnect(true);
    return;
  }

  // Create an adapter that will translate events from the CoveyRoomController into
  // events that the socket protocol knows about
  const listener = roomSocketAdapter(socket);
  controller1.addRoomListener(listener);

  // Register an event listener for the client socket: if the client disconnects,
  // clean up our listener adapter, and then let the CoveyRoomController know that the
  // player's session is disconnected
  socket.on('disconnect', () => {
    controller1.removeRoomListener(listener);
    controller1.destroySession(s);
  });

  // Register an event listener for the client socket: if the client updates their
  // location, inform the CoveyRoomController
  socket.on('playerMovement', (movementData: UserLocation) => {
    controller1.updatePlayerLocation(s.player, movementData);
  });
}
