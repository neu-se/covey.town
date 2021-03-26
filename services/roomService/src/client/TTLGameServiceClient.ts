import axios, {AxiosInstance, AxiosResponse} from 'axios';
import assert from 'assert';
import {
  GameCreateRequest,
  GameCreateResponse,
  GameDeleteRequest, GameJoinRequest, GameJoinResponse,
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

  async createTicGame(requestData: GameCreateRequest): Promise<GameCreateResponse> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<GameCreateResponse>>('/ttl', requestData);
    return TTLGameServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async updateTicGame(requestData: GameUpdateRequest): Promise<void> {
    const responseWrapper = await this._axios.patch<ResponseEnvelope<void>>(`/ttl-games/${requestData.gameID}`, requestData);
    return TTLGameServiceClient.unwrapOrThrowError(responseWrapper, true);
  }

  async deleteTicGame(requestData: GameDeleteRequest): Promise<void> {
    const responseWrapper = await this._axios.delete<ResponseEnvelope<void>>(`/ttl-games/${requestData.gameID}`);
    return TTLGameServiceClient.unwrapOrThrowError(responseWrapper, true);
  }

  async listTicGames(): Promise<GameListResponse> {
    const responseWrapper = await this._axios.get<ResponseEnvelope<GameListResponse>>('/ttl-games');
    return TTLGameServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async joinTicGame(requestData: GameJoinRequest): Promise<GameJoinResponse> {
    const responseWrapper = await this._axios.patch(`/ttl-games/${requestData.gameID}`, requestData);
    return TTLGameServiceClient.unwrapOrThrowError(responseWrapper);
  }

}
