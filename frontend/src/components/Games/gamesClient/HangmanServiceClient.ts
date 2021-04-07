import axios, {AxiosInstance, AxiosResponse} from 'axios';
import assert from 'assert';
import {
  ResponseEnvelope,
  HangmanGameCreateRequest,
  HangmanGameCreateResponse,
  HangmanGameDeleteRequest, HangmanGameJoinRequest, HangmanGameJoinResponse, HangmanGameListResponse,
  HangmanGameUpdateRequest,
} from './HangmanTypes';


export default class HangmanServiceClient {
  private _axios: AxiosInstance;
  constructor(serviceURL: string) {
    this._axios = axios.create({
      baseURL: serviceURL,
    });
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


  async createHangmanGame(requestData: HangmanGameCreateRequest): Promise<HangmanGameCreateResponse> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<HangmanGameCreateResponse>>('/hangman', requestData);
    return HangmanServiceClient.unwrapOrThrowError(responseWrapper);
  }


  async updateHangmanGame(requestData: HangmanGameUpdateRequest): Promise<void> {
    const responseWrapper = await this._axios.patch<ResponseEnvelope<void>>(`/hangman-games/${requestData.gameID}`, requestData);
    return HangmanServiceClient.unwrapOrThrowError(responseWrapper, true);
  }


  async deleteHangmanGame(requestData: HangmanGameDeleteRequest): Promise<void> {
    const responseWrapper = await this._axios.delete<ResponseEnvelope<void>>(`/hangman-games/${requestData.gameID}`);
    return HangmanServiceClient.unwrapOrThrowError(responseWrapper, true);
  }


  async listHangmanGames(): Promise<HangmanGameListResponse> {
    const responseWrapper = await this._axios.get<ResponseEnvelope<HangmanGameListResponse>>('/hangman-games');
    return HangmanServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async joinHangmanGame(requestData: HangmanGameJoinRequest): Promise<HangmanGameJoinResponse> {
    const responseWrapper = await this._axios.patch(`/hangman-games/${requestData.gameID}`, requestData);
    return HangmanServiceClient.unwrapOrThrowError(responseWrapper);
  }
}