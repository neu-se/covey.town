import { nanoid } from 'nanoid';
import CoveyRoomsStore from './CoveyRoomsStore';

describe('CoveyRoomController', () => {
  it('should set the coveyRoomID property', () => {
    const roomsStore = CoveyRoomsStore.getInstance();
    const roomName = nanoid();
    const roomController = roomsStore.getControllerForRoom(roomName);
    expect(roomController.coveyRoomID)
      .toBe(roomName);
  });
});
