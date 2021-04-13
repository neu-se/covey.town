import assert from 'assert';
import { Socket } from 'socket.io';
import Player from '../types/Player';
import { CoveyTownList, UserLocation } from '../CoveyTypes';
import CoveyTownListener from '../types/CoveyTownListener';
import { CoveyTownsStore, updateTown } from '../lib/CoveyTownsStore';
import {
  deleteUser,
  updateUser,
  getTownByID,
  saveTown,
  unsaveTown,
  getCurrentAvatar,
  updateAvatar,
} from '../database/databaseService';

/**
 * The format of a request to join a Town in Covey.Town, as dispatched by the server middleware
 */
export interface TownJoinRequest {
  /** userName of the player that would like to join * */
  userName: string;
  /** ID of the town that the player would like to join * */
  coveyTownID: string;
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
  /** List of players currently in this town * */
  currentPlayers: Player[];
  /** Friendly name of this town * */
  friendlyName: string;
  /** Is this a private town? * */
  isPubliclyListed: boolean;
}

/**
 * Payload sent by client to create a Town in Covey.Town
 */
export interface TownCreateRequest {
  friendlyName: string;
  isPubliclyListed: boolean;
  creator: string;
}

/**
 * Response from the server for a Town create request
 */
export interface TownCreateResponse {
  coveyTownID: string;
  coveyTownPassword: string;
}

/**
 * Response from the server for a Town list request
 */
export interface TownListResponse {
  towns: CoveyTownList;
}

/**
 * Payload sent by the client to delete a Town
 */
export interface TownDeleteRequest {
  coveyTownID: string;
  coveyTownPassword: string;
}

export interface CreateUserRequest {
  email: string;
}

export interface DeleteUserRequest {
  email: string;
}

export interface SavedTownsRequest {
  email: string;
}

export interface SaveTownRequest {
  email: string;
  coveyTownID: string;
}

export interface UnsaveTownRequest {
  email: string;
  coveyTownID: string;
}

/**
 * Payload sent by the client to update a Town.
 * N.B., JavaScript is terrible, so:
 * if(!isPubliclyListed) -> evaluates to true if the value is false OR undefined, use ===
 */
export interface TownUpdateRequest {
  coveyTownID: string;
  coveyTownPassword: string;
  friendlyName?: string;
  isPubliclyListed?: boolean;
}

export interface GetAvatarRequest {
  email: string;
}

export interface UpdateAvatarRequest {
  email: string;
  avatar: string;
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
 * A handler to process a player's request to join a town. The flow is:
 *  1. Client makes a TownJoinRequest, this handler is executed
 *  2. Client uses the sessionToken returned by this handler to make a subscription to the town,
 *  @see townSubscriptionHandler for the code that handles that request.
 *
 * @param requestData an object representing the player's request
 */
export async function townJoinHandler(requestData: TownJoinRequest): Promise<ResponseEnvelope<TownJoinResponse>> {
  const townsStore = await CoveyTownsStore.getInstance();

  const coveyTownController = townsStore.getControllerForTown(requestData.coveyTownID);
  if (!coveyTownController) {
    return {
      isOK: false,
      message: 'Error: No such town',
    };
  }
  const town = await getTownByID(requestData.coveyTownID);
  const newPlayer = new Player(requestData.userName);
  const newSession = await coveyTownController.addPlayer(newPlayer);
  assert(newSession.videoToken);
  if (town) {
    return {
      isOK: true,
      response: {
        coveyUserID: newPlayer.id,
        coveySessionToken: newSession.sessionToken,
        providerVideoToken: newSession.videoToken,
        currentPlayers: coveyTownController.players,
        friendlyName: town.friendlyName,
        isPubliclyListed: town.isPublicallyListed,
      },
    };
  }
  return {
    isOK: false,
  };
}

export async function getAvatarHandler(requestData: GetAvatarRequest): Promise<ResponseEnvelope<string>>{
  const currentAvatar = await getCurrentAvatar(requestData.email);
  return {
    isOK: true,
    response: currentAvatar,
  };
}

export async function updateAvatarHandler(requestData: UpdateAvatarRequest): Promise<ResponseEnvelope<void>> {
  await updateAvatar(requestData.email, requestData.avatar);
  return {
    isOK: true,
  };
}

export async function createUserHandler(requestData: CreateUserRequest): Promise<ResponseEnvelope<void>> {
  await updateUser(requestData.email);
  return {
    isOK: true,
  };
}

export async function userDeleteHandler(requestData: DeleteUserRequest): Promise<ResponseEnvelope<void>> {
  await deleteUser(requestData.email);
  return {
    isOK: true,
  };
}

export async function townListHandler(): Promise<ResponseEnvelope<TownListResponse>> {
  const townsStore = await CoveyTownsStore.getInstance();
  const townList: CoveyTownList = await townsStore.getTowns();
  return {
    isOK: true,
    response: { towns: townList },
  };
}

export async function savedTownHandler(requestData: SavedTownsRequest): Promise<ResponseEnvelope<TownListResponse>> {
  const townsStore = await CoveyTownsStore.getInstance();
  const townList: CoveyTownList = await townsStore.getSavedTowns(requestData.email);
  return {
    isOK: true,
    response: { towns: townList },
  };
}

export async function saveTownHandler(requestData: SaveTownRequest): Promise<ResponseEnvelope<void>> {
  await saveTown(requestData.email, requestData.coveyTownID);
  return {
    isOK: true,
  };
}

export async function deleteSavedTownHandler(requestData: UnsaveTownRequest): Promise<ResponseEnvelope<void>> {
  await unsaveTown(requestData.email, requestData.coveyTownID);
  return {
    isOK: true,
  };
}

export async function townCreateHandler(requestData: TownCreateRequest): Promise<ResponseEnvelope<TownCreateResponse>> {
  const townsStore = await CoveyTownsStore.getInstance();
  if (requestData.friendlyName.length === 0) {
    return {
      isOK: false,
      message: 'FriendlyName must be specified',
    };
  }
  const newTown = await townsStore.createTown(requestData.friendlyName, requestData.isPubliclyListed, requestData.creator);
  return {
    isOK: true,
    response: {
      coveyTownID: newTown.coveyTownController.coveyTownID,
      coveyTownPassword: newTown.coveyTownPassword,
    },
  };
}

export async function townDeleteHandler(requestData: TownDeleteRequest): Promise<ResponseEnvelope<Record<string, null>>> {
  const townsStore = await CoveyTownsStore.getInstance();
  const success = await townsStore.deleteTown(requestData.coveyTownID, requestData.coveyTownPassword);
  return {
    isOK: success,
    response: {},
    message: !success ? 'Invalid password. Please double check your town update password.' : undefined,
  };
}

export async function townUpdateHandler(requestData: TownUpdateRequest): Promise<ResponseEnvelope<Record<string, null>>> {
  const success = await updateTown(requestData.coveyTownID, requestData.coveyTownPassword, requestData.friendlyName, requestData.isPubliclyListed);
  return {
    isOK: success,
    response: {},
    message: !success ? 'Invalid password or update values specified. Please double check your town update password.' : undefined,
  };

}

/**
 * An adapter between CoveyTownController's event interface (CoveyTownListener)
 * and the low-level network communication protocol
 *
 * @param socket the Socket object that we will use to communicate with the player
 */
function townSocketAdapter(socket: Socket): CoveyTownListener {
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
    onTownDestroyed() {
      socket.emit('townClosing');
      socket.disconnect(true);
    },
  };
}

/**
 * A handler to process a remote player's subscription to updates for a town
 *
 * @param socket the Socket object that we will use to communicate with the player
 */
export async function townSubscriptionHandler(socket: Socket): Promise<void> {
  // Parse the client's session token from the connection
  // For each player, the session token should be the same string returned by joinTownHandler
  const { token, coveyTownID } = socket.handshake.auth as { token: string; coveyTownID: string };
  const townController = await CoveyTownsStore.getInstance()
    .then(instance => { 
      const s = instance.getControllerForTown(coveyTownID);
      return s;
    });
  // Retrieve our metadata about this player from the TownController
  const s = townController?.getSessionByToken(token);
  if (!s || !townController) {
    // No valid session exists for this token, hence this client's connection should be terminated
    socket.disconnect(true);
    return;
  }

  // Create an adapter that will translate events from the CoveyTownController into
  // events that the socket protocol knows about
  const listener = townSocketAdapter(socket);
  townController.addTownListener(listener);

  // Register an event listener for the client socket: if the client disconnects,
  // clean up our listener adapter, and then let the CoveyTownController know that the
  // player's session is disconnected
  socket.on('disconnect', () => {
    townController.removeTownListener(listener);
    townController.destroySession(s);
  });

  // Register an event listener for the client socket: if the client updates their
  // location, inform the CoveyTownController
  socket.on('playerMovement', (movementData: UserLocation) => {
    townController.updatePlayerLocation(s.player, movementData);
  });
}
