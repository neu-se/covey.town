import CoveyRoomController from './CoveyRoomController';
import { CoveyRoomList } from '../CoveyTypes';

function passwordMatches(provided: string, expected: string): boolean{
  if(provided === expected){
    return true;
  }
  if(process.env.MASTER_TOWN_PASSWORD && process.env.MASTER_TOWN_PASWORD == provided){
    return true;
  }
  return false;
}

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

  getRooms(): CoveyRoomList {
    return this._rooms.filter(roomController => roomController.isPubliclyListed)
      .map(roomController => ({
        coveyRoomID: roomController.coveyRoomID,
        friendlyName: roomController.friendlyName,
        currentOccupancy: roomController.occupancy,
        maximumOccupancy: 8,
      }));
  }

  createRoom(friendlyName: string, isPubliclyListed: boolean): CoveyRoomController {
    const newRoom = new CoveyRoomController(friendlyName, isPubliclyListed);
    this._rooms.push(newRoom);
    return newRoom;
  }

  updateRoom(coveyRoomID: string, coveyRoomPassword: string, friendlyName?: string, makePublic?: boolean): boolean {
    const existingRoom = this.getControllerForRoom(coveyRoomID);
    if (existingRoom && passwordMatches(coveyRoomPassword, existingRoom.roomUpdatePassword)) {
      if (friendlyName !== undefined) {
        if (friendlyName.length === 0) {
          return false;
        }
        existingRoom.friendlyName = friendlyName;
      }
      if (makePublic !== undefined) {
        existingRoom.isPubliclyListed = makePublic;
      }
      return true;
    }
    return false;
  }

  deleteRoom(coveyRoomID: string, coveyRoomPassword: string): boolean {
    const existingRoom = this.getControllerForRoom(coveyRoomID);
    if (existingRoom && passwordMatches(coveyRoomPassword, existingRoom.roomUpdatePassword)) {
      this._rooms = this._rooms.filter(room => room !== existingRoom);
      existingRoom.disconnectAllPlayers();
      return true;
    }
    return false;
  }

}
