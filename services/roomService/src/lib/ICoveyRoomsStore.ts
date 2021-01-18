import CoveyRoomController from './CoveyRoomController';

/**
 * An abstraction for a class that will track all of the rooms
 */
export default interface ICoveyRoomsStore {
  /**
   * Retrieve the CoveyRoomController for a given room. If no controller exists,
   * this method should create one.
   *
   * @param coveyRoomID the ID of the requested room
   */
  getControllerForRoom(coveyRoomID: string): CoveyRoomController
}
