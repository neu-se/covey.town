import axios, { AxiosInstance, AxiosResponse } from 'axios';
import assert from 'assert';
import {
  ResponseEnvelope,
  GameCreateRequest,
  GameCreateResponse,
  GameDeleteRequest, GameListResponse,
  GameUpdateRequest,
} from './Types';


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


  async createHangmanGame(requestData: GameCreateRequest): Promise<GameCreateResponse> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<GameCreateResponse>>('/hangman', requestData);
    return HangmanServiceClient.unwrapOrThrowError(responseWrapper);
  }


  async updateHangmanGame(requestData: GameUpdateRequest): Promise<void> {
    const responseWrapper = await this._axios.patch<ResponseEnvelope<void>>(`/hangman-games/${requestData.gameId}`, requestData);
    return HangmanServiceClient.unwrapOrThrowError(responseWrapper, true);
  }


  async deleteHangmanGame(requestData: GameDeleteRequest): Promise<void> {
    const responseWrapper = await this._axios.delete<ResponseEnvelope<void>>(`/hangman-games/${requestData.gameId}`);
    return HangmanServiceClient.unwrapOrThrowError(responseWrapper, true);
  }


  async listHangmanGames(): Promise<GameListResponse> {
    const responseWrapper = await this._axios.get<ResponseEnvelope<GameListResponse>>('/hangman-games');
    return HangmanServiceClient.unwrapOrThrowError(responseWrapper);
  }
}
