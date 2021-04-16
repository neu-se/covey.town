import Express from 'express';
import CORS from 'cors';
import http from 'http';
import { nanoid } from 'nanoid';
import { AddressInfo } from 'net';
import * as TestUtils from './TestUtils';

import { UserLocation } from '../CoveyTypes';
import TownsServiceClient from './TownsServiceClient';
import addTownRoutes from '../router/towns';

type TestTownData = {
  friendlyName: string, coveyTownID: string,
  isPubliclyListed: boolean, townUpdatePassword: string
};

describe('TownServiceApiSocket', () => {
  let server: http.Server;
  let apiClient: TownsServiceClient;

  async function createTownForTesting(friendlyNameToUse?: string, isPublic = false): Promise<TestTownData> {
    const friendlyName = friendlyNameToUse !== undefined ? friendlyNameToUse :
      `${isPublic ? 'Public' : 'Private'}TestingTown=${nanoid()}`;
    const ret = await apiClient.createTown({
      friendlyName,
      isPubliclyListed: isPublic,
    });
    return {
      friendlyName,
      isPubliclyListed: isPublic,
      coveyTownID: ret.coveyTownID,
      townUpdatePassword: ret.coveyTownPassword,
    };
  }

  beforeAll(async () => {
    const app = Express();
    app.use(CORS());
    server = http.createServer(app);

    addTownRoutes(server, app);
    server.listen();
    const address = server.address() as AddressInfo;

    apiClient = new TownsServiceClient(`http://127.0.0.1:${address.port}`);
  });
  afterAll(async () => {
    server.close();
    TestUtils.cleanupSockets();
  });
  afterEach(() => {
    TestUtils.cleanupSockets();
  });
  it('Rejects invalid CoveyTownIDs, even if otherwise valid session token', async () => {
    const town = await createTownForTesting();
    const joinData = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const {socketDisconnected} = TestUtils.createSocketClient(server, joinData.coveySessionToken, nanoid());
    await socketDisconnected;
  });
  it('Rejects invalid session tokens, even if otherwise valid town id', async () => {
    const town = await createTownForTesting();
    await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const {socketDisconnected} = TestUtils.createSocketClient(server, nanoid(), town.coveyTownID);
    await socketDisconnected;
  });
  it('Dispatches movement updates to all clients in the same town', async () => {
    const town = await createTownForTesting();
    const joinData = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const joinData2 = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const joinData3 = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const socketSender = TestUtils.createSocketClient(server, joinData.coveySessionToken, town.coveyTownID).socket;
    const {playerMoved} = TestUtils.createSocketClient(server, joinData2.coveySessionToken, town.coveyTownID);
    const {playerMoved: playerMoved2} = TestUtils.createSocketClient(server, joinData3.coveySessionToken, town.coveyTownID);
    const newLocation: UserLocation = {x: 100, y: 100, moving: true, rotation: 'back'};
    socketSender.emit('playerMovement', newLocation);
    const [movedPlayer, otherMovedPlayer]= await Promise.all([playerMoved, playerMoved2]);
    expect(movedPlayer.location).toMatchObject(newLocation);
    expect(otherMovedPlayer.location).toMatchObject(newLocation);
  });
  it('Invalidates the user session after disconnection', async () => {
    // This test will timeout if it fails - it will never reach the expectation
    const town = await createTownForTesting();
    const joinData = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const {socket, socketConnected} = TestUtils.createSocketClient(server, joinData.coveySessionToken, town.coveyTownID);
    await socketConnected;
    socket.close();
    const {socket: secondTryWithSameToken, socketDisconnected: secondSocketDisconnected} = TestUtils.createSocketClient(server, joinData.coveySessionToken, town.coveyTownID);
    await secondSocketDisconnected;
    expect(secondTryWithSameToken.disconnected).toBe(true);
  });
  it('Informs all new players when a player joins', async () => {
    const town = await createTownForTesting();
    const joinData = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const joinData2 = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const {socketConnected, newPlayerJoined} = TestUtils.createSocketClient(server, joinData.coveySessionToken, town.coveyTownID);
    const {
      socketConnected: connectPromise2,
      newPlayerJoined: newPlayerPromise2,
    } = TestUtils.createSocketClient(server, joinData2.coveySessionToken, town.coveyTownID);
    await Promise.all([socketConnected, connectPromise2]);
    const newJoinerName = nanoid();

    await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: newJoinerName});
    expect((await newPlayerJoined)._userName).toBe(newJoinerName);
    expect((await newPlayerPromise2)._userName).toBe(newJoinerName);

  });
  it('Informs all players when a player disconnects', async () => {
    const town = await createTownForTesting();
    const joinData = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const joinData2 = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const userWhoLeaves = nanoid();
    const joinDataWhoLeaves = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: userWhoLeaves});
    const {socketConnected, playerDisconnected} = TestUtils.createSocketClient(server, joinData.coveySessionToken, town.coveyTownID);
    const {socketConnected: connectPromise2, playerDisconnected: playerDisconnectPromise2} = TestUtils.createSocketClient(server, joinData2.coveySessionToken, town.coveyTownID);
    const {socket: socketWhoLeaves, socketConnected: connectPromise3} = TestUtils.createSocketClient(server, joinDataWhoLeaves.coveySessionToken, town.coveyTownID);
    await Promise.all([socketConnected, connectPromise2, connectPromise3]);
    socketWhoLeaves.close();
    expect((await playerDisconnected)._userName).toBe(userWhoLeaves);
    expect((await playerDisconnectPromise2)._userName).toBe(userWhoLeaves);

  });
  it('Informs all players when the town is destroyed', async () => {
    const town = await createTownForTesting();
    const joinData = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const joinData2 = await apiClient.joinTown({coveyTownID: town.coveyTownID, userName: nanoid()});
    const {socketDisconnected, socketConnected} = TestUtils.createSocketClient(server, joinData.coveySessionToken, town.coveyTownID);
    const {socketDisconnected: disconnectPromise2, socketConnected: connectPromise2} = TestUtils.createSocketClient(server, joinData2.coveySessionToken, town.coveyTownID);
    await Promise.all([socketConnected, connectPromise2]);
    await apiClient.deleteTown({coveyTownID: town.coveyTownID, coveyTownPassword: town.townUpdatePassword});
    await Promise.all([socketDisconnected, disconnectPromise2]);
  });
});
