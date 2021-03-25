import axios, {AxiosInstance, AxiosResponse} from 'axios';
import assert from 'assert';
import {
  ResponseEnvelope,
  TicGameCreateRequest,
  TicGameCreateResponse,
  TicGameDeleteRequest, TicGameJoinRequest, TicGameJoinResponse, TicGameListResponse,
  TicGameUpdateRequest,
} from './TicTypes';

export default class TicTacToeServiceClient {
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

  async createTicGame(requestData: TicGameCreateRequest): Promise<TicGameCreateResponse> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<TicGameCreateResponse>>('/tic-tac-toe', requestData);
    return TicTacToeServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async updateTicGame(requestData: TicGameUpdateRequest): Promise<void> {
    const responseWrapper = await this._axios.patch<ResponseEnvelope<void>>(`/tic-tac-toe-games/${requestData.gameID}`, requestData);
    return TicTacToeServiceClient.unwrapOrThrowError(responseWrapper, true);
  }

  async deleteTicGame(requestData: TicGameDeleteRequest): Promise<void> {
    const responseWrapper = await this._axios.delete<ResponseEnvelope<void>>(`/tic-tac-toe-games/${requestData.gameID}`);
    return TicTacToeServiceClient.unwrapOrThrowError(responseWrapper, true);
  }

  async listTicGames(): Promise<TicGameListResponse> {
    const responseWrapper = await this._axios.get<ResponseEnvelope<TicGameListResponse>>('/tic-tac-toe-games');
    return TicTacToeServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async joinTicGame(requestData: TicGameJoinRequest): Promise<TicGameJoinResponse> {
    const responseWrapper = await this._axios.patch(`/tic-tac-toe-games/${requestData.gameID}`, requestData);
    return TicTacToeServiceClient.unwrapOrThrowError(responseWrapper);
  }

}
