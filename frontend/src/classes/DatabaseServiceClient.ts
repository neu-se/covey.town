import axios, { AxiosInstance, AxiosResponse } from 'axios';
import assert from 'assert';

export interface UserEmailRequest {
  email: string;
  }

  export type User = {
  firstName: string,
  lastName: string,
  email: string,
  friends: string [],
  isOnline: boolean
};
  
export type UserStatus = {
  email: string,
  isOnline: boolean
};

/**
 * Payload sent by client to set a user's status
 */
 export interface StatusChangeRequest {
    email: string;
    isOnline: boolean;
  }


/**
 * Payload sent by client to add a user to the database
 */
 export interface AddUserRequest {
    user: User;
  }

/**
 * Payload sent by client to add a friend to friendlist
 */
 export interface AddFriendRequest {
    email: string
    friendEmail: string
  }

/**
 * Payload sent by client to delete a friend from friendlist
 */
 export interface RemoveFriendRequest {
    email: string
    friendEmail: string
  }

/**
 * Envelope that wraps any response from the server
 */
export interface ResponseEnvelope<T> {
    isOK: boolean;
    message?: string;
    response?: T;
  }


export default class DatabaseServiceClient {
    private _axios: AxiosInstance;
  
    /**
     * Construct a new DB API client. Specify a serviceURL for testing, or otherwise
     * defaults to the URL at the environmental variable REACT_APP_ROOMS_SERVICE_URL
     * @param serviceURL
     */

    constructor(serviceURL?: string) {
      const baseURL = serviceURL || process.env.REACT_APP_DATABASE_SERVICE_URL;
      assert(baseURL);
      this._axios = axios.create({ baseURL });
    }
  
    static unwrapOrThrowError<T>(response: AxiosResponse<ResponseEnvelope<T>>, ignoreResponse = false): T {
      if (response.data.isOK) {
        if (ignoreResponse) {
          return {} as T;
        }
        assert(response.data.response !== undefined);
        return response.data.response;
      }
      throw new Error(`Error processing request: ${response.data.message}`);
    }


    async userExistence(requestData: UserEmailRequest): Promise<boolean> {
      const responseWrapper = await this._axios.get<ResponseEnvelope<boolean>>(`/users/${requestData.email}`);
      return DatabaseServiceClient.unwrapOrThrowError(responseWrapper);
    }
  
    async getFriends(requestData: UserEmailRequest): Promise<UserStatus[]> {
        const responseWrapper = await this._axios.get<ResponseEnvelope<UserStatus[]>>(`/users/${requestData.email}/friends`);
        return DatabaseServiceClient.unwrapOrThrowError(responseWrapper);
    }


    async getOnlineStatus(requestData: UserEmailRequest): Promise<boolean> {
        const responseWrapper = await this._axios.get<ResponseEnvelope<boolean>>(`/users/${requestData.email}/status`);
        return DatabaseServiceClient.unwrapOrThrowError(responseWrapper);
    }

    async setOnlineStatus(requestData: StatusChangeRequest): Promise<Record<string, null>> {
        const responseWrapper = await this._axios.post<ResponseEnvelope<Record<string, null>>>(`/users/status/`,requestData);
        return DatabaseServiceClient.unwrapOrThrowError(responseWrapper,true);
    }

    async addUser(requestData: AddUserRequest): Promise<Record<string, null>> {
        const responseWrapper = await this._axios.post<ResponseEnvelope<Record<string, null>>>(`/users/`,requestData);
        return DatabaseServiceClient.unwrapOrThrowError(responseWrapper,true);
    }

    async addFriend(requestData: AddFriendRequest): Promise<Record<string, null>> {
        const responseWrapper = await this._axios.post<ResponseEnvelope<Record<string, null>>>(`/users/${requestData.email}/friends/${requestData.friendEmail}`);
        return DatabaseServiceClient.unwrapOrThrowError(responseWrapper,true);
    }

    async deleteFriend(requestData: RemoveFriendRequest): Promise<Record<string, null>> {
        const responseWrapper = await this._axios.delete<ResponseEnvelope<Record<string, null>>>(`/users/${requestData.email}/friends/${requestData.friendEmail}`);
        return DatabaseServiceClient.unwrapOrThrowError(responseWrapper, true);
      }
  }
  