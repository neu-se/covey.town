import { nanoid } from 'nanoid';
import CoveyRoomsStore from './CoveyRoomsStore';
import CoveyRoomController from './CoveyRoomController';

const mockNewCoveyRoomController = jest.fn();
jest.mock('./CoveyRoomController', () => jest.fn()
  .mockImplementation((coveyRoomId: string) => {
    mockNewCoveyRoomController(coveyRoomId);
    return {
      coveyRoomID: coveyRoomId,
    };
  }));

describe('CoveyRoomsStore', () => {
  beforeEach(() => {
    // eslint-disable-next-line
    // @ts-ignore - this is a mock (and the type system won't know)
    CoveyRoomController.mockClear();
    mockNewCoveyRoomController.mockClear();
  });
  it('should be a singleton', () => {
    const store1 = CoveyRoomsStore.getInstance();
    const store2 = CoveyRoomsStore.getInstance();
    expect(store1)
      .toBe(store2);
  });
  it('should create a new controller only when the room id doesn\'t exist', () => {
    const store = CoveyRoomsStore.getInstance();
    const roomID = nanoid();
    const controller = store.getControllerForRoom(roomID);
    expect(mockNewCoveyRoomController.mock.calls.length)
      .toBe(1); // there should have been exactly one call to new CoveyRoomController()
    expect(mockNewCoveyRoomController.mock.calls[0][0])
      .toBe(roomID); // and, the parameter passed should match the room id exactly
    const controller2 = store.getControllerForRoom(roomID);
    // calling a second time with same room id shouldn't result in a new
    // call to new CoveyRoomController()
    expect(mockNewCoveyRoomController.mock.calls.length)
      .toBe(1);
    // both calls should have returned the exact same object
    expect(controller)
      .toBe(controller2);
  });
  it('should support many different room id\'s', () => {
    const store = CoveyRoomsStore.getInstance();
    const testInvocations = [];
    for (let i = 0; i < 50; i += 1) {
      const roomID = nanoid();
      testInvocations.push({
        controller: store.getControllerForRoom(roomID),
        roomID,
      });
    }
    for (let i = 0; i < testInvocations.length; i += 1) {
      const invocation = testInvocations[i];
      const res = store.getControllerForRoom(invocation.roomID);
      expect(res)
        .toBe(invocation.controller);
    }
  });
});
