import axios, { AxiosInstance } from 'axios';
import {
  RoomCreateRequest,
  RoomCreateResponse,
  RoomDeleteRequest,
  RoomJoinRequest,
  RoomJoinResponse,
  RoomListResponse,
  RoomUpdateRequest,
} from '../requestHandlers/CoveyRoomRequestHandlers';
import { removeThisFunctionCallWhenYouImplementThis } from '../Utils';

export default class RoomServiceClient {

  private _axios: AxiosInstance;

  /**
   * Initialize a new API client to connect to the RoomService API that is located at the specified
   * service URL
   *
   * @param serviceURL Base URL of API service to connect to. For example, if the API server is
   * running at http://localhost:8081/, the serviceURL is http://localhost:8081/
   */
  constructor(serviceURL: string) {
    this._axios = axios.create({
      baseURL: serviceURL,
    });
  }

  /**
   * Create a new room in Covey.Town's room service
   *
   * If any error is returned by the API, this method throws a new Error object.
   *
   * @param requestData
   */
  async createRoom(requestData: RoomCreateRequest): Promise<RoomCreateResponse> {
    // TODO, remove this line when you implement this function
    throw removeThisFunctionCallWhenYouImplementThis({data: requestData, axios: this._axios});
  }

  /**
   * Update a room in Covey.Town's room service.
   *
   * If any error is returned by the API, this method throws a new Error object.
   *
   * @param requestData
   */
  async updateRoom(requestData: RoomUpdateRequest): Promise<void> {
    // TODO, remove this line when you implement this function
    throw removeThisFunctionCallWhenYouImplementThis({data: requestData, axios: this._axios});
  }

  /**
   * Deletes a room in Covey.Town's room service
   *
   * If any error is returned by the API, this method throws a new Error object.
   *
   * @param requestData
   */
  async deleteRoom(requestData: RoomDeleteRequest): Promise<void> {
    // TODO, remove this line when you implement this function
    throw removeThisFunctionCallWhenYouImplementThis({data: requestData, axios: this._axios});
  }

  /**
   * Lists all of the publicly available rooms in Covey.Town's room service
   *
   * If any error is returned by the API, this method throws a new Error object.
   */
  async listRooms(): Promise<RoomListResponse> {
    // TODO, remove this line when you implement this function
    throw removeThisFunctionCallWhenYouImplementThis({axios: this._axios});
  }

  /**
   * Establishes a new session, allowing a user to join an existing room
   *
   * If any error is returned by the API, this method throws a new Error object.
   *
   * @param requestData
   */
  async joinRoom(requestData: RoomJoinRequest): Promise<RoomJoinResponse> {
    // TODO, remove this line when you implement this function
    throw removeThisFunctionCallWhenYouImplementThis({data: requestData, axios: this._axios});
  }

}
