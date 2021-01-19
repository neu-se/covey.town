import { nanoid } from 'nanoid';
import CoveyRoomsStore from './CoveyRoomsStore';
import TwilioVideo from './TwilioVideo';
import Player from '../types/Player';

jest.mock('./TwilioVideo');

const mockGetTokenForRoom = jest.fn();
// eslint-disable-next-line
// @ts-ignore it's a mock
TwilioVideo.getInstance = () => ({
  getTokenForRoom: mockGetTokenForRoom,
});
describe('CoveyRoomController', () => {
  beforeEach(() => {
    mockGetTokenForRoom.mockClear();
  });
  it('should set the coveyRoomID property', () => {
    const roomsStore = CoveyRoomsStore.getInstance();
    const roomName = nanoid();
    const roomController = roomsStore.getControllerForRoom(roomName);
    expect(roomController.coveyRoomID)
      .toBe(roomName);
  });
  it('should use the coveyRoomID and userName properties when requesting a video token',
    async () => {
      const roomsStore = CoveyRoomsStore.getInstance();
      const roomName = nanoid();
      const roomController = roomsStore.getControllerForRoom(roomName);
      const newPlayerSession = await roomController.addPlayer(new Player(nanoid()));
      expect(mockGetTokenForRoom.mock.calls.length)
        .toBe(1); // should have called getToken once
      // should have passed the room name to getToken
      expect(mockGetTokenForRoom.mock.calls[0][0])
        .toBe(roomName);
      // should have passed the player id to getToken
      expect(mockGetTokenForRoom.mock.calls[0][1])
        .toBe(newPlayerSession.player.id);
    });
});
