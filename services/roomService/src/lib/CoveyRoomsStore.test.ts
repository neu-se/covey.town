import CoveyRoomsStore from './CoveyRoomsStore';
import CoveyRoomController from './CoveyRoomController';

const mockNewCoveyRoomController = jest.fn();
jest.mock('./CoveyRoomController', () => {
  return jest.fn()
    .mockImplementation((coveyRoomId: string) => {
      mockNewCoveyRoomController(coveyRoomId);
      return {
        coveyRoomID: coveyRoomId,
      };
    });
});

describe('CoveyRoomsStore', () => {
  beforeEach(() => {
    // @ts-ignore
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
    const controller = store.getControllerForRoom('test1');
    expect(mockNewCoveyRoomController.mock.calls.length)
      .toBe(1);
    expect(mockNewCoveyRoomController.mock.calls[0][0])
      .toBe('test1');
    const controller2 = store.getControllerForRoom('test1');
    expect(mockNewCoveyRoomController.mock.calls.length)
      .toBe(1);
    expect(controller)
      .toBe(controller2);
  });
});
