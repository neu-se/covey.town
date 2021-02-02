import CoveyRoomController from './CoveyRoomController';
import { CoveyRoomList } from '../CoveyTypes';
import { removeThisFunctionCallWhenYouImplementThis } from '../Utils';

export default class CoveyRoomsStore {
  private static _instance: CoveyRoomsStore;

  private _rooms: CoveyRoomController[] = [];

  static getInstance(): CoveyRoomsStore {
    if (CoveyRoomsStore._instance === undefined) {
      CoveyRoomsStore._instance = new CoveyRoomsStore();
    }
    return CoveyRoomsStore._instance;
  }

  getControllerForRoom(coveyRoomId: string): CoveyRoomController | undefined {
    return this._rooms.find(room => room.coveyRoomID === coveyRoomId);
  }

  /**
   * Returns a list of all of the publicly-visible rooms, representing each room as
   * {friendlyName: string, coveyRoomID: string}
   */
  getRooms(): CoveyRoomList {
    // TODO, remove this line when you implement this function
    throw removeThisFunctionCallWhenYouImplementThis(this);
  }

  /**
   * Creates a new room and returns the room's `CoveyRoomController`.
   *
   * @param friendlyName
   * @param isPubliclyListed
   */
  createRoom(friendlyName: string, isPubliclyListed: boolean): CoveyRoomController {
    // TODO, remove this line when you implement this function
    throw removeThisFunctionCallWhenYouImplementThis({friendlyName, isPubliclyListed, this:this});
  }

  /**
   * Updates the friendlyName and/or public visibility of a room if there is a room that has the
   * specified ID and password. Only updates fields that are passed (note friendlyName or makePublic
   * might be undefined). Returns true if a room was found matching the ID and password, or false
   * otherwise. If there are no updates (e.g. friendlyName === undefined && makePublic === undefined),
   * but the room ID and password are valid, this method should still return true.
   *
   * @param coveyRoomID
   * @param coveyRoomPassword
   * @param friendlyName
   * @param makePublic
   */
  updateRoom(coveyRoomID: string, coveyRoomPassword: string, friendlyName?: string, makePublic?: boolean): boolean {
    // TODO, remove this line when you implement this function
    throw removeThisFunctionCallWhenYouImplementThis({coveyRoomID, coveyRoomPassword, friendlyName, makePublic, this:this});
  }

  /**
   * Deletes the room specified by ID. Only deletes the room if the password specified as a
   * parameter here matches the password stored by the matching CoveyRoomController. This method
   * should both remove the room from the RoomStore's listing of rooms, and also disconnect
   * any players from the room (by calling CoveyRoomController.disconnectAllPlayers).
   *
   * Returns true if the room was found, password matched, and the room was deleted. Otherwise
   * returns false.
   *
   * @param coveyRoomID
   * @param coveyRoomPassword
   */
  deleteRoom(coveyRoomID: string, coveyRoomPassword: string): boolean {
    // TODO, remove this line when you implement this function
    throw removeThisFunctionCallWhenYouImplementThis({coveyRoomID, coveyRoomPassword}, this);
  }
}
