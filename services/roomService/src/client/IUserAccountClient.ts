import axios, { AxiosInstance, AxiosResponse } from 'axios';
import assert from 'assert';
import { UserLocation } from '../CoveyTypes';


export type ServerPlayer = { _id: string, _userName: string, location: UserLocation };

/**
 * The format of a request to join a Town in Covey.Town, as dispatched by the server middleware
 */
export interface AccountLoginRequest {
  /** userName that the player has created an account for * */
  userName: string;
  /** password for that account * */
  password: string;
}

/**
 * The format of a response to logging in, as returned by the handler to the server middleware
 */
export interface AccountLoginResponse {
  /** userName that the player has created an account for * */
  userName: string;
  /** password for that account * */
  password: string;
  /** avatar chose and stored by user from their previous login session * */
  avatar: string;
}

/**
 * info user enter to create a new account
 */
export interface UserAccountCreateRequest {
  userName: string;
  password: string;
}

/**
 * Response from the server for a user account request
 */
export interface UserAccountCreateResponse {
  userName: string;
  password: string;
}

/**
 * Envelope that wraps any response from the server
 */
export interface ResponseEnvelope<T> {
  isOK: boolean;
  message?: string;
  response?: T;
}


export type UserAccountInfo = {
  userName: string;
  avatar: string;
};

/**
 * Response from the server for a Town list request
 */
export interface TownListResponse {
  towns: UserAccountInfo[];
}

export default class AccountsServiceClient {
  private _axios: AxiosInstance;

  /**
   * Construct a new Towns Service API client. Specify a serviceURL for testing, or otherwise
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

  async createAccount(requestData: UserAccountCreateRequest): Promise<UserAccountCreateResponse> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<UserAccountCreateResponse>>('/users', requestData);
    return AccountsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  
  async loginAccount(requestData: AccountLoginRequest): Promise<AccountLoginResponse> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<AccountLoginResponse>>('/users', requestData);
    return AccountsServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async listAccounts(): Promise<TownListResponse> {
    const responseWrapper = await this._axios.get<ResponseEnvelope<TownListResponse>>('/towns');
    return AccountsServiceClient.unwrapOrThrowError(responseWrapper);
  }


}
