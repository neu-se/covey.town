import axios, { AxiosInstance, AxiosResponse } from 'axios';
import assert from 'assert';
import { User, UserStatus } from '../components/Login/testingDB';

/**
 * Payload sent by client to check if a user exists 
 */
 export interface UserExistenceRequest {
    emailID: string;
  }
/**
 * Response from the server for if a user exists
 */
  export interface UserExistenceResponse {
    exists: boolean;
  }


/**
 * Payload sent by client to get a user's friends 
 */
 export interface GetUsersFriendsRequest {
    emailID: string;
  }
/**
 * Response from the server to get a user's friends 
 */
 export interface GetUsersFriendsResponse {
    friendList: UserStatus[];
  }


/**
 * Payload sent by client to get a user's status
 */
 export interface GetUsersStatusRequest {
    emailID: string;
  }

/**
 * Response from the server to for user's status
 */
 export interface GetUsersStatusResponse {
    status: boolean;
  }

/**
 * Payload sent by client to set a user's status
 */
 export interface SetUsersStatusRequest {
    emailID: string;
    status: boolean;
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
    emailID: string
    friendEmailID: string
  }

/**
 * Payload sent by client to delete a friend from friendlist
 */
 export interface DeleteFriendRequest {
    emailID: string
    friendEmailID: string
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
    
      const baseURL = serviceURL || process.env.REACT_APP_TOWNS_SERVICE_URL;
      assert(baseURL);
      this._axios = axios.create({ baseURL });
    }
  
    static unwrapOrThrowError<T>(response: AxiosResponse<ResponseEnvelope<T>>, ignoreResponse = false): T {
      if (response.data.isOK) {
        if (ignoreResponse) {
          return {} as T;
        }
        assert(response.data.response);
        return response.data.response;
      }
      throw new Error(`Error processing request: ${response.data.message}`);
    }


    async userExistence(requestData: UserExistenceRequest): Promise<UserExistenceResponse> {
      const responseWrapper = await this._axios.post<ResponseEnvelope<UserExistenceResponse>>(`/users/${requestData.emailID}`);
      return DatabaseServiceClient.unwrapOrThrowError(responseWrapper);
    }
  
    async getFriends(requestData: GetUsersFriendsRequest): Promise<GetUsersFriendsResponse> {
        const responseWrapper = await this._axios.post<ResponseEnvelope<GetUsersFriendsResponse>>(`/users/${requestData.emailID}/friends`);
        return DatabaseServiceClient.unwrapOrThrowError(responseWrapper);
    }


    async getOnlineStatus(requestData: GetUsersStatusRequest): Promise<GetUsersStatusResponse> {
        const responseWrapper = await this._axios.post<ResponseEnvelope<GetUsersStatusResponse>>(`/users/${requestData.emailID}/status`);
        return DatabaseServiceClient.unwrapOrThrowError(responseWrapper);
    }

    async setOnlineStatus(requestData: SetUsersStatusRequest): Promise<void> {
        const responseWrapper = await this._axios.post<ResponseEnvelope<void>>(`/users/${requestData.emailID}/status/${requestData.status}`);
        return DatabaseServiceClient.unwrapOrThrowError(responseWrapper);
    }

    async addUser(requestData: AddUserRequest): Promise<void> {
        const responseWrapper = await this._axios.post<ResponseEnvelope<void>>(`/users/${requestData.user}`);
        return DatabaseServiceClient.unwrapOrThrowError(responseWrapper);
    }

    async addFriend(requestData: AddFriendRequest): Promise<void> {
        const responseWrapper = await this._axios.post<ResponseEnvelope<void>>(`/users/${requestData.emailID}/friends/${requestData.friendEmailID}`);
        return DatabaseServiceClient.unwrapOrThrowError(responseWrapper);
    }

    async deleteFriend(requestData: DeleteFriendRequest): Promise<void> {
        const responseWrapper = await this._axios.delete<ResponseEnvelope<void>>(`/users/${requestData.emailID}/friends/${requestData.friendEmailID}`);
        return DatabaseServiceClient.unwrapOrThrowError(responseWrapper, true);
      }
  }
  