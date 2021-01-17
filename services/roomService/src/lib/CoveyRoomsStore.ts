export default class CoveyRoomsStore {
  static getInstance(): CoveyRoomsStore {
    throw new Error('Not implemented');
  }

  getControllerForRoom(coveyRoomId: string) {
    throw new Error(`Not implemented, received request for: ${coveyRoomId} ${this}`);
  }
}
