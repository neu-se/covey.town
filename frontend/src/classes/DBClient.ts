import axios, { AxiosInstance, AxiosResponse } from 'axios';
import assert from 'assert';
import { UserStatus } from '../components/Login/testingDB';

/**
 * The format of a request to add a friend in Covey.Town, as dispatched by the server middleware
 */
 export interface AddFriendRequest {
    /** userName of the player that would like to add a friend* */
    userName: string;
    /** ID of the friend that the player would like to add to their friend list * */
    friendUserName: string;
  }

  /**
 * The format of a response to join a Town in Covey.Town, as returned by the handler to the server
 * middleware
 */
export interface AddFriendResponse {
    /** Unique UserName that represents this player * */
    userName: string;

    /** ID of the friend that the player would like to add to their friend list * */
    friendUserName: string;

    /** Is this friend currently online?* */
    friendIsOnline: boolean;
  }

/**
 * The format of a request to add a friend in Covey.Town, as dispatched by the server middleware
 */
 export interface GetUsersFriendRequest {
    /** userName of the player whos friend list is being queried* */
    userName: string;
  }

/**
 * The format of a response to get all of a users' friends in Covey.Town, as dispatched by the server middleware
 */
 export interface GetUsersFriendResponse {

    /** usernames of the friends that the player has in their their friend list * */
    friendsUserNames: UserStatus[];
  }

/**
 * The format of a request to search for a friend in Covey.Town, as dispatched by the server middleware
 */
 export interface SearchForFriendRequest {
    /** first and last name of the friend that the player would like to search for in the DB  * */
    firstName: string;
    lastName: string;
  }

/**
 * Response from the server for a friend search request
 */
export interface SearchForFriendResponse {

    /** boolean if there are any users with names input in DB* */
    friendExistsInDB: boolean;

    /** list of the usernames of the friends if they exist* */
    friendUserName?: string[];

  }

/**
 * Payload sent by the client to delete a friend from friend list
 */
export interface FriendDeleteRequest {
    userName: string;
    friendUserName: string;
  }

  /**
 * Envelope that wraps any response from the server
 */
export interface ResponseEnvelope<T> {
    isOK: boolean;
    message?: string;
    response?: T;
  }


  export default class DBClient {
    private _axios: AxiosInstance;
  
    /**
     * Construct a new DB API client. Specify a serviceURL for testing, or otherwise
     * defaults to the URL at the environmental variable REACT_APP_ROOMS_SERVICE_URL
     * @param serviceURL
     */

    constructor(serviceURL?: string) {
    
      // Look into this for our implementation...is it the same baseURL because it's going to coveytown?
      // How do we create the /users post? - is in the file w/ the app.post app.get?
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
  
    async addFriend(requestData: AddFriendRequest): Promise<AddFriendResponse> {
      const responseWrapper = await this._axios.post<ResponseEnvelope<AddFriendResponse>>(`/users/${requestData.friendUserName}`);
      return DBClient.unwrapOrThrowError(responseWrapper);
    }
  
    async searchForFriend(requestData: SearchForFriendRequest): Promise<SearchForFriendResponse> {
        const responseWrapper = await this._axios.get<ResponseEnvelope<SearchForFriendResponse>>(`/users/${requestData.firstName}/${requestData.lastName}`, );
        return DBClient.unwrapOrThrowError(responseWrapper);
      }
  
    async deleteFriend(requestData: FriendDeleteRequest): Promise<void> {
        const responseWrapper = await this._axios.delete<ResponseEnvelope<void>>(`/users/${requestData.friendUserName}`);
        return DBClient.unwrapOrThrowError(responseWrapper, true);
      }

  }
  