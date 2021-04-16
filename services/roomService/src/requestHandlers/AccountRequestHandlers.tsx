import { JoinedTown, UserInfo } from '../AccountTypes';
import { getUserByID, upsertUser, resetUser, deleteUser, SavedUserInfoRequest } from '../lib/UserPreferencesRepository';

/**
 * Payload sent by client to save a user in Covey.Town
 */
export interface SaveUserRequest {
  userID: string;
  email?: string;
  username?: string;
  useAudio?: boolean;
  useVideo?: boolean;
  towns?: JoinedTown[];
}

/**
 * Payload sent by client to request information for a user's ID
 */
export interface GetUserRequest {
  userID: string;
}

/**
 * Response from the server for a get user request
 */
export interface GetUserResponse {
  userID: string;
  email: string;
  username: string;
  useAudio: boolean;
  useVideo: boolean;
  towns: JoinedTown[];
}

/**
 * Payload sent by client to reset a user's saved preferences specified by a certain ID
 */
export interface ResetUserRequest {
  userID: string;
}

/**
 * Payload sent by client to delete a user specified by a certain ID
 */
export interface DeleteUserRequest {
  userID: string;
}

/**
 * Envelope that wraps any response from the server
 */
export interface ResponseEnvelope<T> {
  isOK: boolean;
  message?: string;
  response?: T;
}

export async function saveUserHandler(requestData: SaveUserRequest): Promise<ResponseEnvelope<Record<string, null>>> {
  if (requestData.userID.length === 0) {
    return {
      isOK: false,
      message: 'User ID must be specified when saving a user',
    };
  }
  const success = await upsertUser(requestData as SavedUserInfoRequest);

  return {
    isOK: success,
    response: {},
    message: !success ? 'Failed to save user preferences for user' : undefined,
  };
}

export async function getUserHandler(requestData: GetUserRequest): Promise<ResponseEnvelope<GetUserResponse>> {
  if (requestData.userID.length === 0) {
    return {
      isOK: false,
      message: 'User id must be specified when retrieving user details',
    };
  }

  const user = await getUserByID(requestData.userID);

  if (user) {
    return {
      isOK: true,
      response: user as UserInfo,
    };
  }

  return {
    isOK: false,
    message: 'Failed to get user information',
  };
}

export async function resetUserHandler(requestData: ResetUserRequest): Promise<ResponseEnvelope<Record<string, null>>> {
  if (requestData.userID.length === 0) {
    return {
      isOK: false,
      message: 'User ID must be specified when deleting a user',
    };
  }
  const success = await resetUser(requestData.userID);

  return {
    isOK: success,
    response: {},
    message: !success ? 'Failed to delete user' : undefined,
  };
}

export async function deleteUserHandler(requestData: DeleteUserRequest): Promise<ResponseEnvelope<Record<string, null>>> {
  if (requestData.userID.length === 0) {
    return {
      isOK: false,
      message: 'User ID must be specified when deleting a user',
    };
  }
  const success = await deleteUser(requestData.userID);

  return {
    isOK: success,
    response: {},
    message: !success ? 'Failed to delete user' : undefined,
  };
}
