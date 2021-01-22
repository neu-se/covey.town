import { nanoid } from 'nanoid';
import { Socket } from 'socket.io';
import assert from 'assert';
import {
  roomJoinHandler,
  RoomJoinRequest,
  roomSubscriptionHandler,
} from './CoveyRoomRequestHandlers';

const mockSocketEmitFunction = jest.fn();
const mockSocketDisconnectFunction = jest.fn();
const mockSocketOnFunction = jest.fn();

describe('roomJoinHandler', () => {
  it('should retrieve the same coveyRoomController for multiple requests on the same room', async () => {
    const requestData: RoomJoinRequest = {
      coveyRoomID: nanoid(),
      userName: nanoid(),
    };
    const firstResponse = await roomJoinHandler(requestData);
    expect(firstResponse.currentPlayers.length).toBe(1); // Should start out with just us

    const requestDataForSameRoom: RoomJoinRequest = {
      coveyRoomID: requestData.coveyRoomID,
      userName: nanoid(),
    };
    const secondResponse = await roomJoinHandler(requestDataForSameRoom);
    expect(secondResponse.currentPlayers.length).toBe(2); // Should have first player too
  });
  it('should support multiple rooms', async () => {
    const requestData: RoomJoinRequest = {
      coveyRoomID: nanoid(),
      userName: nanoid(),
    };
    const firstResponse = await roomJoinHandler(requestData);
    expect(firstResponse.currentPlayers.length).toBe(1); // Should start out with just us

    const requestDataForDifferentRoom: RoomJoinRequest = {
      coveyRoomID: nanoid(),
      userName: nanoid(),
    };
    const secondResponse = await roomJoinHandler(requestDataForDifferentRoom);
    expect(secondResponse.currentPlayers.length).toBe(1); // should be a different room

    const requestDataForSameRoom: RoomJoinRequest = {
      coveyRoomID: requestData.coveyRoomID,
      userName: nanoid(),
    };
    const lastResponse = await roomJoinHandler(requestDataForSameRoom);
    expect(lastResponse.currentPlayers.length).toBe(2); // Should have first player too
  });
});

function mockSocket(coveyRoomID: string, coveySessionToken: string): Socket {
  return {
    // eslint-disable-next-line
    // @ts-ignore - we knowingly don't implement the actual socket API here
    handshake: {
      auth: {
        token: coveySessionToken,
        coveyRoomID,
      },
    },
    // eslint-disable-next-line
    // @ts-ignore
    disconnect: (param: boolean) => {
      mockSocketDisconnectFunction(param);
    },
    // eslint-disable-next-line
    // @ts-ignore
    emit: (event: string, payload: Record<unknown, unknown>) => {
      mockSocketEmitFunction(event, payload);
    },
    // eslint-disable-next-line
    // @ts-ignore
    on: (event: string, callback: Record<unknown, unknown>) => {
      mockSocketOnFunction(event, callback);
    },
  };
}

describe('roomSubscriptionHandler', () => {
  beforeEach(() => {
    mockSocketDisconnectFunction.mockClear();
    mockSocketEmitFunction.mockClear();
    mockSocketOnFunction.mockClear();
  });
  it('should accept a connection with a valid room and session token', async () => {
    const preFlightRequestData: RoomJoinRequest = {
      coveyRoomID: nanoid(),
      userName: nanoid(),
    };
    const preFlightResponse = await roomJoinHandler(preFlightRequestData);
    roomSubscriptionHandler(
      mockSocket(preFlightRequestData.coveyRoomID, preFlightResponse.coveySessionToken),
    );
    expect(mockSocketDisconnectFunction.mock.calls.length).toBe(0); // This was a valid session token, should not have called disconnect
  });
  it('should accept a connection with a valid room and session token, and allow that token to be reused if the session is not destroyed', async () => {
    const preFlightRequestData: RoomJoinRequest = {
      coveyRoomID: nanoid(),
      userName: nanoid(),
    };
    const preFlightResponse = await roomJoinHandler(preFlightRequestData);
    roomSubscriptionHandler(
      mockSocket(preFlightRequestData.coveyRoomID, preFlightResponse.coveySessionToken),
    );
    roomSubscriptionHandler(
      mockSocket(preFlightRequestData.coveyRoomID, preFlightResponse.coveySessionToken),
    );
    roomSubscriptionHandler(
      mockSocket(preFlightRequestData.coveyRoomID, preFlightResponse.coveySessionToken),
    );
    expect(mockSocketDisconnectFunction.mock.calls.length).toBe(0); // This was a valid session token, should not have called disconnect
  });
  it('should accept a connection with a valid room and session token, then no longer accept it once that client disconnects', async () => {
    const preFlightRequestData: RoomJoinRequest = {
      coveyRoomID: nanoid(),
      userName: nanoid(),
    };
    const preFlightResponse = await roomJoinHandler(preFlightRequestData);
    roomSubscriptionHandler(
      mockSocket(preFlightRequestData.coveyRoomID, preFlightResponse.coveySessionToken),
    );
    // If all went correctly in roomSubscriptionHandler, the disconnect handler should have been
    // registered
    const disconnectCallback = mockSocketOnFunction.mock.calls.find(
      call => call[0] === 'disconnect',
    );
    assert(disconnectCallback);
    // Call that disconnect callback, which should destroy this session
    disconnectCallback[1]();

    roomSubscriptionHandler(
      mockSocket(preFlightRequestData.coveyRoomID, preFlightResponse.coveySessionToken),
    );
    expect(mockSocketDisconnectFunction.mock.calls.length).toBe(1); // That session token should have been destroyed in the server
  });
  it('should reject a connection without a valid session token for the room', async () => {
    const preFlightRequestData: RoomJoinRequest = {
      coveyRoomID: nanoid(),
      userName: nanoid(),
    };
    const preFlightResponse = await roomJoinHandler(preFlightRequestData);
    roomSubscriptionHandler(
      mockSocket(preFlightRequestData.coveyRoomID, preFlightResponse.coveySessionToken),
    );
    expect(mockSocketDisconnectFunction.mock.calls.length).toBe(0); // This was a valid session token, should not have called disconnect

    const preFlightRequestData2: RoomJoinRequest = {
      coveyRoomID: preFlightRequestData.coveyRoomID,
      userName: nanoid(),
    };
    await roomJoinHandler(preFlightRequestData2);
    roomSubscriptionHandler(mockSocket(preFlightRequestData.coveyRoomID, nanoid()));
    expect(mockSocketDisconnectFunction.mock.calls.length).toBe(1); // This was a not valid session token, should have called disconnect
  });
  it("should reject a connection without a valid session token for the room, even if it's valid for another room", async () => {
    const request1: RoomJoinRequest = {
      coveyRoomID: nanoid(),
      userName: nanoid(),
    };
    const preFlightResponse = await roomJoinHandler(request1);
    const request2: RoomJoinRequest = {
      coveyRoomID: nanoid(),
      userName: nanoid(),
    };
    await roomJoinHandler(request2);
    roomSubscriptionHandler(mockSocket(request2.coveyRoomID, preFlightResponse.coveySessionToken));
    expect(mockSocketDisconnectFunction.mock.calls.length).toBe(1); // This was a valid session token, should not have called disconnect
  });
  it('should accept a connection with a valid session token for the room, regardless of order those tokens were issued', async () => {
    const request1: RoomJoinRequest = {
      coveyRoomID: nanoid(),
      userName: nanoid(),
    };
    const preFlightResponse = await roomJoinHandler(request1);
    const request2: RoomJoinRequest = {
      coveyRoomID: nanoid(),
      userName: nanoid(),
    };
    const preFlightResponse2 = await roomJoinHandler(request2);
    roomSubscriptionHandler(mockSocket(request2.coveyRoomID, preFlightResponse2.coveySessionToken));
    roomSubscriptionHandler(mockSocket(request1.coveyRoomID, preFlightResponse.coveySessionToken));

    expect(mockSocketDisconnectFunction.mock.calls.length).toBe(0); // This was a valid session token, should not have called disconnect
  });
});
