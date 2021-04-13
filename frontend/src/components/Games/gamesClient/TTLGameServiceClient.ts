import axios, { AxiosInstance, AxiosResponse } from 'axios';
import assert from 'assert';
import {
  GameCreateRequest,
  GameCreateResponse,
  GameDeleteRequest,
  GameListResponse,
  GameUpdateRequest,
  ResponseEnvelope,
} from './Types';

export default class TTLGameServiceClient {
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

  async createTTLGame(requestData: GameCreateRequest): Promise<GameCreateResponse> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<GameCreateResponse>>('/ttl', requestData);
    return TTLGameServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async updateTTLGame(requestData: GameUpdateRequest): Promise<void> {
    const responseWrapper = await this._axios.patch<ResponseEnvelope<void>>(`/ttl-games/${requestData.gameId}`, requestData);
    return TTLGameServiceClient.unwrapOrThrowError(responseWrapper, true);
  }

  async deleteTTLGame(requestData: GameDeleteRequest): Promise<void> {
    const responseWrapper = await this._axios.delete<ResponseEnvelope<void>>(`/ttl-games/${requestData.gameId}`);
    return TTLGameServiceClient.unwrapOrThrowError(responseWrapper, true);
  }

  async listTTLGames(): Promise<GameListResponse> {
    const responseWrapper = await this._axios.get<ResponseEnvelope<GameListResponse>>('/ttl-games');
    return TTLGameServiceClient.unwrapOrThrowError(responseWrapper);
  }
}
