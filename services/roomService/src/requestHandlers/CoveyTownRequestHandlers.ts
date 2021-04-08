import assert from 'assert';
import { Socket } from 'socket.io';
import Player from '../types/Player';
import { CoveyTownList, UserLocation } from '../CoveyTypes';
import CoveyTownListener from '../types/CoveyTownListener';
import CoveyTownsStore from '../lib/CoveyTownsStore';
import DatabaseController, { AccountCreateResponse, LoginResponse, NeighborStatus, ListUsersResponse, UserWithRelationship, UsersList } from '../database/db';

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

export interface AccountCreateRequest {
  username: string,
  password: string,
}

export interface LoginRequest {
  username: string,
  password: string,
}

export interface SearchUsersRequest {
  currentUserId: string,
  username: string,
}

export interface AddNeighborRequest {
  currentUserId: string,
  UserIdToRequest: string,
}

export interface AddNeighborResponse {
  status: string,
}

export interface AcceptNeighborRequestRequest {
  userAccepting: string,
  userSent: string,
}

export interface RemoveNeighborRequestRequest {
  currentUser: string,
  requestedUser: string,
}

export interface RemoveNeighborMappingRequest {
  currentUser: string,
  neighbor: string,
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
  const townsStore = CoveyTownsStore.getInstance();

  const coveyTownController = townsStore.getControllerForTown(requestData.coveyTownID);
  if (!coveyTownController) {
    return {
      isOK: false,
      message: 'Error: No such town',
    };
  }
  const newPlayer = new Player(requestData.userName);
  const newSession = await coveyTownController.addPlayer(newPlayer);
  assert(newSession.videoToken);
  return {
    isOK: true,
    response: {
      coveyUserID: newPlayer.id,
      coveySessionToken: newSession.sessionToken,
      providerVideoToken: newSession.videoToken,
      currentPlayers: coveyTownController.players,
      friendlyName: coveyTownController.friendlyName,
      isPubliclyListed: coveyTownController.isPubliclyListed,
    },
  };
}

export async function townListHandler(): Promise<ResponseEnvelope<TownListResponse>> {
  const townsStore = CoveyTownsStore.getInstance();
  return {
    isOK: true,
    response: { towns: townsStore.getTowns() },
  };
}

export async function townCreateHandler(requestData: TownCreateRequest): Promise<ResponseEnvelope<TownCreateResponse>> {
  const townsStore = CoveyTownsStore.getInstance();
  if (requestData.friendlyName.length === 0) {
    return {
      isOK: false,
      message: 'FriendlyName must be specified',
    };
  }
  const newTown = townsStore.createTown(requestData.friendlyName, requestData.isPubliclyListed);
  return {
    isOK: true,
    response: {
      coveyTownID: newTown.coveyTownID,
      coveyTownPassword: newTown.townUpdatePassword,
    },
  };
}

export async function townDeleteHandler(requestData: TownDeleteRequest): Promise<ResponseEnvelope<Record<string, null>>> {
  const townsStore = CoveyTownsStore.getInstance();
  const success = townsStore.deleteTown(requestData.coveyTownID, requestData.coveyTownPassword);
  return {
    isOK: success,
    response: {},
    message: !success ? 'Invalid password. Please double check your town update password.' : undefined,
  };
}

export async function townUpdateHandler(requestData: TownUpdateRequest): Promise<ResponseEnvelope<Record<string, null>>> {
  const townsStore = CoveyTownsStore.getInstance();
  const success = townsStore.updateTown(requestData.coveyTownID, requestData.coveyTownPassword, requestData.friendlyName, requestData.isPubliclyListed);
  return {
    isOK: success,
    response: {},
    message: !success ? 'Invalid password or update values specified. Please double check your town update password.' : undefined,
  };

}

export async function accountCreateHandler(requestData: AccountCreateRequest): Promise<ResponseEnvelope<AccountCreateResponse>> {
  try {
    if (requestData.password.length === 0 || requestData.password === '') {
      return {
        isOK: false,
        message: 'Invalid Password',
      };
    }

    const db = new DatabaseController();
    await db.connect();
    const checkUsernameExists = await db.findUserIdByUsername(requestData.username);
    if (checkUsernameExists !== 'user_not_found') {
      return {
        isOK: false,
        message: 'Username Taken',
      };
    }
    const result = await db.insertUser(requestData.username, requestData.password);
    db.close();
    return {
      isOK: true,
      response: result,
    };
  } catch (err) {
    return {
      isOK: false,
      message: err.toString(),
    };
  }
}

export async function loginHandler(requestData: LoginRequest): Promise<ResponseEnvelope<LoginResponse | string>> {
  try {
    if (requestData.password.length === 0 || requestData.password === '') {
      return {
        isOK: false,
        message: 'Invalid Password',
      };
    }

    const db = new DatabaseController();
    await db.connect();
    const findUser = await db.findUserIdByUsername(requestData.username);
    if (findUser === 'user_not_found') {
      return {
        isOK: false,
        message: 'Invalid Username',
      };
    }

    const result = await db.login(requestData.username, requestData.password);
    db.close();

    if (typeof result === 'string') {
      return {
        isOK: false,
        message: result,
      };
    }

    return {
      isOK: true,
      response: result,
    };
  } catch (err) {
    return {
      isOK: false,
      message: err.toString(),
    };
  }
}

export async function searchUsersByUsername(requestData: SearchUsersRequest) : Promise<ResponseEnvelope<ListUsersResponse<UserWithRelationship>>> {
  try {
    const db = new DatabaseController();
    await db.connect();
    const result = await db.searchUsersByUsername(requestData.currentUserId, requestData.username);

    db.close();
    return {
      isOK: true,
      response: result,
    };
  } catch (err) {
    return {
      isOK: false,
      message: err.toString(),
    };
  }
}

export async function sendAddNeighborRequest(requestData: AddNeighborRequest) : Promise<ResponseEnvelope<AddNeighborResponse>> {
  try {
    const db = new DatabaseController();
    await db.connect();
    const findUser1 = await db.validateUser(requestData.currentUserId);
    if (findUser1 === 'user_not_found') {
      db.close();
      return {
        isOK: false,
        message: 'Sending User Not Found',
      };
    }
    const findUser2 = await db.validateUser(requestData.UserIdToRequest);
    if (findUser2 === 'user_not_found') {
      db.close();
      return {
        isOK: false,
        message: 'Receiving User Not Found',
      };
    }

    const result = await db.sendRequest(requestData.currentUserId, requestData.UserIdToRequest);
    db.close();

    return {
      isOK: true,
      response: result,
    };
  } catch (err) {
    return {
      isOK: false,
      message: err.toString(),
    };
  }
}

export async function acceptRequestHandler(requestData: AcceptNeighborRequestRequest) : Promise<ResponseEnvelope<NeighborStatus>> {
  try {
    const db = new DatabaseController();
    await db.connect();

    const findUser1 = await db.validateUser(requestData.userAccepting);
    if (findUser1 === 'user_not_found') {
      db.close();
      return {
        isOK: false,
        message: 'Sending User Not Found',
      };
    }
    const findUser2 = await db.validateUser(requestData.userSent);
    if (findUser2 === 'user_not_found') {
      db.close();
      return {
        isOK: false,
        message: 'Receiving User Not Found',
      };
    }

    const result: NeighborStatus = await db.acceptRequest(requestData.userAccepting, requestData. userSent);
    db.close();

    if (result.status !== 'neighbor') {
      return {
        isOK: false,
        response: result,
      };
    }
    return {
      isOK: true,
      response: result,
    };
  } catch (err) {
    return {
      isOK: false,
      message: err.toString(),
    };
  }
}

  export async function listNeighbors(currentUserId: string) : Promise<ResponseEnvelope<ListUsersResponse<UsersList>>> {
    try {
      const db = new DatabaseController();
      await db.connect();
      const neighborsList = await db.listNeighbors(currentUserId);

    db.close();
    return {
      isOK: true,
      response: neighborsList,
    }

  } catch (err) {
    return {
      isOK: false,
      message: err.toString()
    }
  }
}

export async function listRequestsReceived(currentUserId: string) : Promise<ResponseEnvelope<ListUsersResponse<UsersList>>> {
  try {
    const db = new DatabaseController();
    await db.connect();

    const requestsReceivedList = await db.listRequestsReceived(currentUserId);

    db.close();
    return {
      isOK: true,
      response: requestsReceivedList,
    }

  } catch (err) {
    return {
      isOK: false,
      message: err.toString()
    }
  }
}

export async function listRequestsSent(currentUserId: string) : Promise<ResponseEnvelope<ListUsersResponse<UsersList>>> {
  try {
    const db = new DatabaseController();
    await db.connect();

    const requestsSentList = await db.listRequestsSent(currentUserId);

    db.close();
    return {
      isOK: true,
      response: requestsSentList,
    }

  } catch (err) {
    return {
      isOK: false,
      message: err.toString()
    }
  }
}



export async function removeNeighborRequestHandler(requestData: RemoveNeighborRequestRequest) : Promise<ResponseEnvelope<NeighborStatus>> {
  try {
    const db = new DatabaseController();
    await db.connect();

    const findUser1 = await db.validateUser(requestData.currentUser);
    if (findUser1 === 'user_not_found') {
      db.close();
      return {
        isOK: false,
        message: 'Sending User Not Found',
      };
    }
    const findUser2 = await db.validateUser(requestData.requestedUser);
    if (findUser2 === 'user_not_found') {
      db.close();
      return {
        isOK: false,
        message: 'Receiving User Not Found',
      };
    }

    const result: NeighborStatus = await db.removeNeighborRequest(requestData.currentUser, requestData.requestedUser);
    db.close();

    if (result.status !== 'unknown') {
      return {
        isOK: false,
        response: result,
      };
    }
    return {
      isOK: true,
      response: result,
    };
  } catch (err) {
    return {
      isOK: false,
      message: err.toString(),
    };
  }
}

export async function removeNeighborMappingHandler(requestData: RemoveNeighborMappingRequest) : Promise<ResponseEnvelope<NeighborStatus>> {
  try {
    const db = new DatabaseController();
    await db.connect();

    const findUser1 = await db.validateUser(requestData.currentUser);
    if (findUser1 === 'user_not_found') {
      db.close();
      return {
        isOK: false,
        message: 'Current User Not Found',
      };
    }
    const findUser2 = await db.validateUser(requestData.neighbor);
    if (findUser2 === 'user_not_found') {
      db.close();
      return {
        isOK: false,
        message: 'Neighbor Not Found',
      };
    }

    const result: NeighborStatus = await db.removeNeighbor(requestData.currentUser, requestData.neighbor);
    db.close();

    if (result.status !== 'unknown') {
      return {
        isOK: false,
        response: result,
      };
    }
    return {
      isOK: true,
      response: result,
    };
  } catch (err) {
    return {
      isOK: false,
      message: err.toString(),
    };
  }
}


// TODO
// add javaDoc
// listNeighbors handler 
// + check who is online with coveytownstore
// listRequestsSent handler 
// listRequestsReceived handler 


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
export function townSubscriptionHandler(socket: Socket): void {
  // Parse the client's session token from the connection
  // For each player, the session token should be the same string returned by joinTownHandler
  const { token, coveyTownID } = socket.handshake.auth as { token: string; coveyTownID: string };

  const townController = CoveyTownsStore.getInstance()
    .getControllerForTown(coveyTownID);

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

