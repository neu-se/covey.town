import axios, { AxiosInstance, AxiosResponse } from 'axios';
import assert from 'assert';
import {
  GameCreateRequest,
  GameCreateResponse,
  GameDeleteRequest,
  GameListResponse,
  GameUpdateRequest, GameUpdateResponse,
  ResponseEnvelope,
} from './GameRequestTypes';

export default class GameServiceClient {
  private _axios: AxiosInstance;

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

  async createGame(requestData: GameCreateRequest): Promise<GameCreateResponse> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<GameCreateResponse>>('/games', requestData);
    return GameServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async updateGame(requestData: GameUpdateRequest): Promise<GameUpdateResponse> {
    const responseWrapper = await this._axios.patch<ResponseEnvelope<GameUpdateResponse>>(`/games/${requestData.gameId}`, requestData);
    return GameServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async deleteGame(requestData: GameDeleteRequest): Promise<void> {
    const responseWrapper = await this._axios.delete<ResponseEnvelope<void>>(`/games/${requestData.gameId}`);
    return GameServiceClient.unwrapOrThrowError(responseWrapper, true);
  }

  async listGames(): Promise<GameListResponse> {
    const responseWrapper = await this._axios.get<ResponseEnvelope<GameListResponse>>('/games');
    return GameServiceClient.unwrapOrThrowError(responseWrapper);

  }
}
