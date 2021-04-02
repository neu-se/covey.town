import assert from 'assert';
import { Socket } from 'socket.io';
import Player from '../types/Player';
import { CoveyHubList, UserLocation } from '../CoveyTypes';
import CoveyHubListener from '../types/CoveyHubListener';
import CoveyHubStore from '../lib/CoveyHubStore';

/**
 * The format of a request to join a Hub in Covey.Town, as dispatched by the server middleware
 */
export interface HubJoinRequest {
  /** userName of the player that would like to join * */
  userName: string;
  /** ID of the Hub that the player would like to join * */
  coveyHubID: string;
}

/**
 * The format of a response to join a Hub in Covey.Town, as returned by the handler to the server
 * middleware
 */
export interface HubJoinResponse {
  /** Unique ID that represents this player * */
  coveyUserID: string;
  /** Secret token that this player should use to authenticate
   * in future requests to this service * */
  coveySessionToken: string;
  /** Secret token that this player should use to authenticate
   * in future requests to the video service * */
  providerVideoToken: string;
  /** List of players currently in this Hub * */
  currentPlayers: Player[];
  /** Friendly name of this Hub * */
  friendlyName: string;
  /** Is this a private Hub? * */
  isPubliclyListed: boolean;
}

/**
 * Payload sent by client to create a Hub in Covey.Town
 */
export interface HubCreateRequest {
  friendlyName: string;
  isPubliclyListed: boolean;

}

/**
 * Response from the server for a Hub create request
 */
export interface HubCreateResponse {
  coveyHubID: string;
  coveyHubPassword: string;
}

/**
 * Response from the server for a Hub list request
 */
export interface HubListResponse {
  hubs: CoveyHubList;
}

/**
 * Payload sent by the client to delete a Hub
 */
export interface HubDeleteRequest {
  coveyHubID: string;
  coveyHubPassword: string;
}

/**
 * Payload sent by the client to update a Hub.
 * N.B., JavaScript is terrible, so:
 * if(!isPubliclyListed) -> evaluates to true if the value is false OR undefined, use ===
 */
export interface HubUpdateRequest {
  coveyHubID: string;
  coveyHubPassword: string;
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
 * A handler to process a player's request to join a hub. The flow is:
 *  1. Client makes a HubJoinRequest, this handler is executed
 *  2. Client uses the sessionToken returned by this handler to make a subscription to the hub,
 *  @see hubSubscriptionHandler for the code that handles that request.
 *
 * @param requestData an object representing the player's request
 */
export async function hubJoinHandler(requestData: HubJoinRequest): Promise<ResponseEnvelope<HubJoinResponse>> {
  const hubsStore = CoveyHubStore.getInstance();

  const coveyHubController = hubsStore.getControllerForHub(requestData.coveyHubID);
  if (!coveyHubController) {
    return {
      isOK: false,
      message: 'Error: No such Hub',
    };
  }
  const newPlayer = new Player(requestData.userName);
  const newSession = await coveyHubController.addPlayer(newPlayer);
  assert(newSession.videoToken);
  return {
    isOK: true,
    response: {
      coveyUserID: newPlayer.id,
      coveySessionToken: newSession.sessionToken,
      providerVideoToken: newSession.videoToken,
      currentPlayers: coveyHubController.players,
      friendlyName: coveyHubController.friendlyName,
      isPubliclyListed: coveyHubController.isPubliclyListed,
    },
  };
}

// Get Hubs for Town Id
export async function hubListHandler(): Promise<ResponseEnvelope<HubListResponse>> {
  const hubsStore = CoveyHubStore.getInstance();
  return {
    isOK: true,
    response: { hubs: hubsStore.getHubs() },
  };
}

/* export async function hubCreateHandler(requestData: HubCreateRequest): Promise<ResponseEnvelope<HubCreateResponse>> {
  const hubsStore = CoveyHubStore.getInstance();
  if (requestData.friendlyName.length === 0) {
    return {
      isOK: false,
      message: 'FriendlyName must be specified',
    };
  }
  const newHub = hubsStore.createHub(requestData.friendlyName, requestData.isPubliclyListed);
  return {
    isOK: true,
    response: {
      coveyHubID: newHub.coveyHubID,
      coveyHubPassword: newHub.hubUpdatePassword,
    },
  };
} */

export async function hubDeleteHandler(requestData: HubDeleteRequest): Promise<ResponseEnvelope<Record<string, null>>> {
  const hubsStore = CoveyHubStore.getInstance();
  const success = hubsStore.deleteHub(requestData.coveyHubID, requestData.coveyHubPassword);
  return {
    isOK: success,
    response: {},
    message: !success ? 'Invalid password. Please double check your hub update password.' : undefined,
  };
}

export async function hubUpdateHandler(requestData: HubUpdateRequest): Promise<ResponseEnvelope<Record<string, null>>> {
  const hubsStore = CoveyHubStore.getInstance();
  const success = hubsStore.updateHub(requestData.coveyHubID, requestData.coveyHubPassword, requestData.friendlyName, requestData.isPubliclyListed);
  return {
    isOK: success,
    response: {},
    message: !success ? 'Invalid password or update values specified. Please double check your hub update password.' : undefined,
  };

}

/**
 * An adapter between CoveyHubController's event interface (CoveyHubListener)
 * and the low-level network communication protocol
 *
 * @param socket the Socket object that we will use to communicate with the player
 */
function hubSocketAdapter(socket: Socket): CoveyHubListener {
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
    onHubDestroyed() {
      socket.emit('hubClosing');
      socket.disconnect(true);
    },
  };
}

/**
 * A handler to process a remote player's subscription to updates for a hub
 *
 * @param socket the Socket object that we will use to communicate with the player
 */
export function hubSubscriptionHandler(socket: Socket): void {
  // Parse the client's session token from the connection
  // For each player, the session token should be the same string returned by joinHubHandler
  const { token, coveyHubID } = socket.handshake.auth as { token: string; coveyHubID: string };

  const hubController = CoveyHubStore.getInstance()
    .getControllerForHub(coveyHubID);

  // Retrieve our metadata about this player from the HubController
  const s = hubController?.getSessionByToken(token);
  if (!s || !hubController) {
    // No valid session exists for this token, hence this client's connection should be terminated
    socket.disconnect(true);
    return;
  }

  // Create an adapter that will translate events from the CoveyHubController into
  // events that the socket protocol knows about
  const listener = hubSocketAdapter(socket);
  hubController.addHubListener(listener);

  // Register an event listener for the client socket: if the client disconnects,
  // clean up our listener adapter, and then let the CoveyHubController know that the
  // player's session is disconnected
  socket.on('disconnect', () => {
    hubController.removeHubListener(listener);
    hubController.destroySession(s);
  });

  // Register an event listener for the client socket: if the client updates their
  // location, inform the CoveyHubController
  socket.on('playerMovement', (movementData: UserLocation) => {
    hubController.updatePlayerLocation(s.player, movementData);
  });
}
