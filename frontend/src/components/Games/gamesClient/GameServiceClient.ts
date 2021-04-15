import axios, { AxiosInstance, AxiosResponse } from 'axios';
import assert from 'assert';
import {
  GameCreateRequest,
  GameCreateResponse,
  GameDeleteRequest, GameListRequest,
  GameListResponse,
  GameUpdateRequest,
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
    const responseWrapper = await this._axios.post<ResponseEnvelope<GameCreateResponse>>(`/towns/${requestData.townID}/games`, requestData);
    return GameServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async updateGame(requestData: GameUpdateRequest): Promise<void> {
    const responseWrapper = await this._axios.patch<ResponseEnvelope<void>>(`/towns/${requestData.townID}/games/${requestData.gameId}`, requestData);
    return GameServiceClient.unwrapOrThrowError(responseWrapper, true);
  }

  async deleteGame(requestData: GameDeleteRequest): Promise<void> {
    const responseWrapper = await this._axios.delete<ResponseEnvelope<void>>(`/towns/${requestData.townID}/games/${requestData.gameId}`);
    return GameServiceClient.unwrapOrThrowError(responseWrapper, true);
  }

  async listGames(requestData: GameListRequest): Promise<GameListResponse> {
    const responseWrapper = await this._axios.get<ResponseEnvelope<GameListResponse>>(`/towns/${requestData.townID}/games`);
    return GameServiceClient.unwrapOrThrowError(responseWrapper);

  }
}
