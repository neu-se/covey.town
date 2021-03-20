import { nanoid } from 'nanoid';
import { Socket } from 'socket.io';
import assert from 'assert';
import {
  ResponseEnvelope,
  townCreateHandler, TownCreateResponse,
  townJoinHandler,
  TownJoinRequest,
  townSubscriptionHandler,
} from './CoveyTownRequestHandlers';

const mockSocketEmitFunction = jest.fn();
const mockSocketDisconnectFunction = jest.fn();
const mockSocketOnFunction = jest.fn();

export function unwrapResponse<T>(response: ResponseEnvelope<T>): T {
  assert(response.response);
  return response.response;
}

export async function createTownForTesting() : Promise<TownCreateResponse> {
  return unwrapResponse(await townCreateHandler({
    isPubliclyListed: false,
    friendlyName: `TestingTown-${nanoid()}`,
  }));
}

describe('townJoinHandler', () => {
  it('should retrieve the same coveyTownController for multiple requests on the same town', async () => {
    const createdTownCreds = await createTownForTesting();
    const requestData: TownJoinRequest = {
      coveyTownID: createdTownCreds.coveyTownID,
      userName: nanoid(),
    };
    const firstResponse = unwrapResponse(await townJoinHandler(requestData));
    expect(firstResponse.currentPlayers.length)
      .toBe(1); // Should start out with just us

    const requestDataForSameTown: TownJoinRequest = {
      coveyTownID: requestData.coveyTownID,
      userName: nanoid(),
    };
    const secondResponse = unwrapResponse(await townJoinHandler(requestDataForSameTown));
    expect(secondResponse.currentPlayers.length)
      .toBe(2); // Should have first player too
  });
  it('should support multiple towns', async () => {
    const createdTownCreds = await createTownForTesting();
    const requestData: TownJoinRequest = {
      coveyTownID: createdTownCreds.coveyTownID,
      userName: nanoid(),
    };
    const firstResponse = unwrapResponse(await townJoinHandler(requestData));
    expect(firstResponse.currentPlayers.length)
      .toBe(1); // Should start out with just us

    const secondCreatedTownCreds = unwrapResponse(await townCreateHandler({
      isPubliclyListed: false,
      friendlyName: nanoid(),
    }));
    const requestDataForDifferentTown: TownJoinRequest = {
      coveyTownID: secondCreatedTownCreds.coveyTownID,
      userName: nanoid(),
    };
    const secondResponse = unwrapResponse(await townJoinHandler(requestDataForDifferentTown));
    expect(secondResponse.currentPlayers.length)
      .toBe(1); // should be a different town

    const requestDataForSameTown: TownJoinRequest = {
      coveyTownID: requestData.coveyTownID,
      userName: nanoid(),
    };
    const lastResponse = unwrapResponse(await townJoinHandler(requestDataForSameTown));
    expect(lastResponse.currentPlayers.length)
      .toBe(2); // Should have first player too
  });

  it('should fail if the town does not exist', async () => {
    const response = await townJoinHandler({
      coveyTownID: 'invalidTownID',
      userName: nanoid(),
    });
    expect(response.isOK)
      .toBe(false);
  });
});

function mockSocket(coveyTownID: string, coveySessionToken: string): Socket {
  return {
    // eslint-disable-next-line
    // @ts-ignore - we knowingly don't implement the actual socket API here
    handshake: {
      auth: {
        token: coveySessionToken,
        coveyTownID,
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

describe('townSubscriptionHandler', () => {
  beforeEach(() => {
    mockSocketDisconnectFunction.mockClear();
    mockSocketEmitFunction.mockClear();
    mockSocketOnFunction.mockClear();
  });

  // it should fail if not a valid town
  it('should accept a connection with a valid town and session token', async () => {

    const createdTownCreds = await createTownForTesting();

    const preFlightRequestData: TownJoinRequest = {
      coveyTownID: createdTownCreds.coveyTownID,
      userName: nanoid(),
    };

    const preFlightResponse = unwrapResponse(await townJoinHandler(preFlightRequestData));
    townSubscriptionHandler(
      mockSocket(preFlightRequestData.coveyTownID, preFlightResponse.coveySessionToken),
    );
    expect(mockSocketDisconnectFunction.mock.calls.length)
      .toBe(0); // This was a valid session token, should not have called disconnect
  });
  it('should accept a connection with a valid town and session token, and allow that token to be reused if the session is not destroyed', async () => {
    const createdTownCreds = await createTownForTesting();

    const preFlightRequestData: TownJoinRequest = {
      coveyTownID: createdTownCreds.coveyTownID,
      userName: nanoid(),
    };
    const preFlightResponse = unwrapResponse(await townJoinHandler(preFlightRequestData));
    townSubscriptionHandler(
      mockSocket(preFlightRequestData.coveyTownID, preFlightResponse.coveySessionToken),
    );
    townSubscriptionHandler(
      mockSocket(preFlightRequestData.coveyTownID, preFlightResponse.coveySessionToken),
    );
    townSubscriptionHandler(
      mockSocket(preFlightRequestData.coveyTownID, preFlightResponse.coveySessionToken),
    );
    expect(mockSocketDisconnectFunction.mock.calls.length)
      .toBe(0); // This was a valid session token, should not have called disconnect
  });
  it('should accept a connection with a valid town and session token, then no longer accept it once that client disconnects', async () => {

    const createdTownCreds = await createTownForTesting();

    const preFlightRequestData: TownJoinRequest = {
      coveyTownID: createdTownCreds.coveyTownID,
      userName: nanoid(),
    };
    const preFlightResponse = unwrapResponse(await townJoinHandler(preFlightRequestData));

    townSubscriptionHandler(
      mockSocket(preFlightRequestData.coveyTownID, preFlightResponse.coveySessionToken),
    );
    // If all went correctly in townSubscriptionHandler, the disconnect handler should have been
    // registered
    const disconnectCallback = mockSocketOnFunction.mock.calls.find(
      call => call[0] === 'disconnect',
    );
    assert(disconnectCallback);
    // Call that disconnect callback, which should destroy this session
    disconnectCallback[1]();

    townSubscriptionHandler(
      mockSocket(preFlightRequestData.coveyTownID, preFlightResponse.coveySessionToken),
    );
    expect(mockSocketDisconnectFunction.mock.calls.length)
      .toBe(1); // That session token should have been destroyed in the server
  });
  it('should reject a connection without a valid session token for the town', async () => {
    const createdTownCreds = await createTownForTesting();

    const preFlightRequestData: TownJoinRequest = {
      coveyTownID: createdTownCreds.coveyTownID,
      userName: nanoid(),
    };

    const preFlightResponse = unwrapResponse(await townJoinHandler(preFlightRequestData));

    townSubscriptionHandler(
      mockSocket(preFlightRequestData.coveyTownID, preFlightResponse.coveySessionToken),
    );
    expect(mockSocketDisconnectFunction.mock.calls.length)
      .toBe(0); // This was a valid session token, should not have called disconnect

    const preFlightRequestData2: TownJoinRequest = {
      coveyTownID: preFlightRequestData.coveyTownID,
      userName: nanoid(),
    };
    await townJoinHandler(preFlightRequestData2);
    townSubscriptionHandler(mockSocket(preFlightRequestData.coveyTownID, nanoid()));
    expect(mockSocketDisconnectFunction.mock.calls.length)
      .toBe(1); // This was a not valid session token, should have called disconnect
  });
  it("should reject a connection without a valid session token for the town, even if it's valid for another town", async () => {

    const createdTownCreds = await createTownForTesting();

    const createdTownCreds2 = await createTownForTesting();

    const request1: TownJoinRequest = {
      coveyTownID: createdTownCreds.coveyTownID,
      userName: nanoid(),
    };
    const preFlightResponse = unwrapResponse(await townJoinHandler(request1));
    const request2: TownJoinRequest = {
      coveyTownID: createdTownCreds2.coveyTownID,
      userName: nanoid(),
    };
    await townJoinHandler(request2);
    townSubscriptionHandler(mockSocket(request2.coveyTownID, preFlightResponse.coveySessionToken));
    expect(mockSocketDisconnectFunction.mock.calls.length)
      .toBe(1); // This was a valid session token, should not have called disconnect
  });
  it('should accept a connection with a valid session token for the town, regardless of order those tokens were issued', async () => {
    const createdTownCreds = await createTownForTesting();
    const createdTownCreds2 = await createTownForTesting();

    const request1: TownJoinRequest = {
      coveyTownID: createdTownCreds.coveyTownID,
      userName: nanoid(),
    };
    const preFlightResponse = unwrapResponse(await townJoinHandler(request1));
    const request2: TownJoinRequest = {
      coveyTownID: createdTownCreds2.coveyTownID,
      userName: nanoid(),
    };
    const preFlightResponse2 = unwrapResponse(await townJoinHandler(request2));

    townSubscriptionHandler(mockSocket(request2.coveyTownID, preFlightResponse2.coveySessionToken));
    townSubscriptionHandler(mockSocket(request1.coveyTownID, preFlightResponse.coveySessionToken));

    expect(mockSocketDisconnectFunction.mock.calls.length)
      .toBe(0); // This was a valid session token, should not have called disconnect
  });
});
