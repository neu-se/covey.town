import { nanoid } from 'nanoid';
import CoveyRoomsStore from './CoveyRoomsStore';
import CoveyRoomListener from '../types/CoveyRoomListener';
import Player from '../types/Player';

const mockCoveyListenerRoomDestroyed = jest.fn();
const mockCoveyListenerOtherFns = jest.fn();

function mockCoveyListener(): CoveyRoomListener {
  return {
    onPlayerDisconnected(removedPlayer: Player): void {
      mockCoveyListenerOtherFns(removedPlayer);
    },
    onPlayerMoved(movedPlayer: Player): void {
      mockCoveyListenerOtherFns(movedPlayer);
    },
    onRoomDestroyed() {
      mockCoveyListenerRoomDestroyed();
    },
    onPlayerJoined(newPlayer: Player) {
      mockCoveyListenerOtherFns(newPlayer);
    },
  };
}

function createRoomForTesting(friendlyNameToUse?: string, isPublic = false) {
  const friendlyName = friendlyNameToUse !== undefined ? friendlyNameToUse :
    `${isPublic ? 'Public' : 'Private'}TestingRoom=${nanoid()}`;
  return CoveyRoomsStore.getInstance()
    .createRoom(friendlyName, isPublic);
}

describe('CoveyRoomsStore', () => {
  beforeEach(() => {
    mockCoveyListenerRoomDestroyed.mockClear();
    mockCoveyListenerOtherFns.mockClear();
  });
  it('should be a singleton', () => {
    const store1 = CoveyRoomsStore.getInstance();
    const store2 = CoveyRoomsStore.getInstance();
    expect(store1)
      .toBe(store2);
  });

  describe('createRoom', () => {
    it('Should allow multiple rooms with the same friendlyName', () => {
      const firstRoom = createRoomForTesting();
      const secondRoom = createRoomForTesting(firstRoom.friendlyName);
      expect(firstRoom)
        .not
        .toBe(secondRoom);
      expect(firstRoom.friendlyName)
        .toBe(secondRoom.friendlyName);
      expect(firstRoom.coveyRoomID)
        .not
        .toBe(secondRoom.coveyRoomID);
    });
  });

  describe('getControllerForRoom', () => {
    it('Should return the same controller on repeated calls', async () => {
      const firstRoom = createRoomForTesting();
      expect(firstRoom)
        .toBe(CoveyRoomsStore.getInstance()
          .getControllerForRoom(firstRoom.coveyRoomID));
      expect(firstRoom)
        .toBe(CoveyRoomsStore.getInstance()
          .getControllerForRoom(firstRoom.coveyRoomID));
    });
  });

  describe('updateRoom', () => {
    it('Should check the password before updating any value', () => {
      const room = createRoomForTesting();
      const { friendlyName } = room;
      const res = CoveyRoomsStore.getInstance()
        .updateRoom(room.coveyRoomID, 'abcd', 'newName', true);
      expect(res)
        .toBe(false);
      expect(room.friendlyName)
        .toBe(friendlyName);
      expect(room.isPubliclyListed)
        .toBe(false);

    });
    it('Should fail if the roomID does not exist', async () => {
      const room = createRoomForTesting();
      const { friendlyName } = room;

      const res = CoveyRoomsStore.getInstance()
        .updateRoom('abcdef', room.roomUpdatePassword, 'newName', true);
      expect(res)
        .toBe(false);
      expect(room.friendlyName)
        .toBe(friendlyName);
      expect(room.isPubliclyListed)
        .toBe(false);

    });
    it('Should update the room parameters', async () => {

      // First try with just a visiblity change
      const room = createRoomForTesting();
      const { friendlyName } = room;
      const res = CoveyRoomsStore.getInstance()
        .updateRoom(room.coveyRoomID, room.roomUpdatePassword, undefined, true);
      expect(res)
        .toBe(true);
      expect(room.isPubliclyListed)
        .toBe(true);
      expect(room.friendlyName)
        .toBe(friendlyName);

      // Now try with just a name change
      const newFriendlyName = nanoid();
      const res2 = CoveyRoomsStore.getInstance()
        .updateRoom(room.coveyRoomID, room.roomUpdatePassword, newFriendlyName, undefined);
      expect(res2)
        .toBe(true);
      expect(room.isPubliclyListed)
        .toBe(true);
      expect(room.friendlyName)
        .toBe(newFriendlyName);

      // Now try to change both
      const res3 = CoveyRoomsStore.getInstance()
        .updateRoom(room.coveyRoomID, room.roomUpdatePassword, friendlyName, false);
      expect(res3)
        .toBe(true);
      expect(room.isPubliclyListed)
        .toBe(false);
      expect(room.friendlyName)
        .toBe(friendlyName);
    });
  });

  describe('deleteRoom', () => {
    it('Should check the password before deleting the room', () => {
      const room = createRoomForTesting();
      const res = CoveyRoomsStore.getInstance()
        .deleteRoom(room.coveyRoomID, `${room.roomUpdatePassword}*`);
      expect(res)
        .toBe(false);
    });
    it('Should fail if the roomID does not exist', async () => {
      const res = CoveyRoomsStore.getInstance()
        .deleteRoom('abcdef', 'efg');
      expect(res)
        .toBe(false);
    });
    it('Should disconnect all players', async () => {
      const room = createRoomForTesting();
      room.addRoomListener(mockCoveyListener());
      room.addRoomListener(mockCoveyListener());
      room.addRoomListener(mockCoveyListener());
      room.addRoomListener(mockCoveyListener());
      room.disconnectAllPlayers();

      expect(mockCoveyListenerOtherFns.mock.calls.length)
        .toBe(0);
      expect(mockCoveyListenerRoomDestroyed.mock.calls.length)
        .toBe(4);
    });
  });

  describe('listRooms', () => {
    it('Should include public rooms', async () => {
      const room = createRoomForTesting(undefined, true);
      const rooms = CoveyRoomsStore.getInstance()
        .getRooms();
      const entry = rooms.filter(roomInfo => roomInfo.coveyRoomID === room.coveyRoomID);
      expect(entry.length)
        .toBe(1);
      expect(entry[0].friendlyName)
        .toBe(room.friendlyName);
      expect(entry[0].coveyRoomID)
        .toBe(room.coveyRoomID);
    });
    it('Should include each CoveyRoomID if there are multiple rooms with the same friendlyName', async () => {
      const room = createRoomForTesting(undefined, true);
      const secondRoom = createRoomForTesting(room.friendlyName, true);
      const rooms = CoveyRoomsStore.getInstance()
        .getRooms()
        .filter(roomInfo => roomInfo.friendlyName === room.friendlyName);
      expect(rooms.length)
        .toBe(2);
      expect(rooms[0].friendlyName)
        .toBe(room.friendlyName);
      expect(rooms[1].friendlyName)
        .toBe(room.friendlyName);

      if (rooms[0].coveyRoomID === room.coveyRoomID) {
        expect(rooms[1].coveyRoomID)
          .toBe(secondRoom.coveyRoomID);
      } else if (rooms[1].coveyRoomID === room.coveyRoomID) {
        expect(rooms[0].coveyRoomID)
          .toBe(room.coveyRoomID);
      } else {
        fail('Expected the coveyRoomIDs to match the rooms that were created');
      }

    });
    it('Should not include private rooms', async () => {
      const room = createRoomForTesting(undefined, false);
      const rooms = CoveyRoomsStore.getInstance()
        .getRooms()
        .filter(roomInfo => roomInfo.friendlyName === room.friendlyName || roomInfo.coveyRoomID === room.coveyRoomID);
      expect(rooms.length)
        .toBe(0);
    });
    it('Should not include private rooms, even if there is a public room of same name', async () => {
      const room = createRoomForTesting(undefined, false);
      const room2 = createRoomForTesting(room.friendlyName, true);
      const rooms = CoveyRoomsStore.getInstance()
        .getRooms()
        .filter(roomInfo => roomInfo.friendlyName === room.friendlyName || roomInfo.coveyRoomID === room.coveyRoomID);
      expect(rooms.length)
        .toBe(1);
      expect(rooms[0].coveyRoomID)
        .toBe(room2.coveyRoomID);
      expect(rooms[0].friendlyName)
        .toBe(room2.friendlyName);
    });
    it('Should not include deleted rooms', async () => {
      const room = createRoomForTesting(undefined, true);
      const rooms = CoveyRoomsStore.getInstance()
        .getRooms()
        .filter(roomInfo => roomInfo.friendlyName === room.friendlyName || roomInfo.coveyRoomID === room.coveyRoomID);
      expect(rooms.length)
        .toBe(1);
      const res = CoveyRoomsStore.getInstance()
        .deleteRoom(room.coveyRoomID, room.roomUpdatePassword);
      expect(res)
        .toBe(true);
      const roomsPostDelete = CoveyRoomsStore.getInstance()
        .getRooms()
        .filter(roomInfo => roomInfo.friendlyName === room.friendlyName || roomInfo.coveyRoomID === room.coveyRoomID);
      expect(roomsPostDelete.length)
        .toBe(0);
    });
  });
});

