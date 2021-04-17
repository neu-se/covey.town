import Express from 'express';
import CORS from 'cors';
import http from 'http';
import { AddressInfo } from 'net';
import addAccountRoutes from '../router/accounts';

import CoveyServicesClient, { GetUserResponse, JoinedTown, SaveUserRequest } from './CoveyServicesClient';

/**
 * Example data for Joined towns 
 */
const town1: JoinedTown = {
  townID: '1',
  positionX: 0,
  positionY: 0,
};

const town2: JoinedTown = {
  townID: '2',
  positionX: 5,
  positionY: 10,
};

const town3: JoinedTown = {
  townID: '3',
  positionX: 10,
  positionY: 10,
};

/**
 * Example data for SaveUserRequest
 */
const jeminSaveUser: SaveUserRequest = {
  userID: 'jemin',
  email: 'jemin@test.com',
  username: 'jem1',
  useAudio: false,
  useVideo: false,
  towns: [],
};

const johnSaveUser: SaveUserRequest = {
  userID: 'john',
  email: 'john@test.com',
  username: 'john1',
  useAudio: true,
  useVideo: false,
  towns: [town1],
};

const tatiSaveUser: SaveUserRequest = {
  userID: 'tatiana',
  email: 'tati@test.com',
  username: 'tati1',
  useAudio: true,
  useVideo: true,
  towns: [town1, town2, town3],
};

/**
 * Example data for userID of users
 */
const jeminUserID = { userID: 'jemin' };

const tatiUserID = { userID: 'tatiana' };

const johnUserID = { userID: 'john' };

const jayUserID = { userID: 'jay' };

/**
 * Example data for DeleteUserRequest
 */
const jeminUserResponse: GetUserResponse = {
  userID: 'jay',
  email: '',
  username: '',
  useAudio: false,
  useVideo: false,
  towns: [],
};

describe('AccountsServicesAPIREST', () => {
  let server: http.Server;
  let apiClient: CoveyServicesClient;

  beforeAll(async () => {
    const app = Express();
    app.use(CORS());
    server = http.createServer(app);

    addAccountRoutes(server, app);
    await server.listen();
    const address = server.address() as AddressInfo;

    apiClient = new CoveyServicesClient(`http://127.0.0.1:${address.port}`);
  });
  afterAll(async () => {
    await server.close();
  });

  describe('saveUser and getUser', () => {
    it('Allows and retrieves user created with fully formatted SaveUserRequest without any joined towns', async () => {
      try {
        await apiClient.saveUser(jeminSaveUser);

        const getUserResult = await apiClient.getUser(jeminUserID);
        expect(getUserResult).toStrictEqual(jeminSaveUser);

        await apiClient.deleteUser(jeminUserID);
      } catch (err){
        // shouldn't fail here
        fail(err.toString());
      }
    });
    it('Allows and retrieves user created with just userID with one joined town', async () => {
      try {
        await apiClient.saveUser(johnSaveUser);

        const getUserResult = await apiClient.getUser(johnUserID);
        expect(getUserResult).toStrictEqual(johnSaveUser);

        await apiClient.deleteUser(johnUserID);
      } catch (err) {
        // shouldn't fail here
        fail(err.toString());
      }
    });
    it('Allows and retrieves user created with just userID with multiple joined town', async () => {
      try {
        await apiClient.saveUser(tatiSaveUser);

        const getUserResult = await apiClient.getUser(tatiUserID);
        expect(getUserResult).toStrictEqual(tatiSaveUser);

        await apiClient.deleteUser(tatiUserID);
      } catch (err) {
        // shouldn't fail here
        fail(err.toString());
      }
    });
    it('Allows and retrieves user created with just userID', async () => {
      try {
        await apiClient.saveUser(jayUserID);

        const getUserResult = await apiClient.getUser(jayUserID);
        expect(getUserResult).toStrictEqual(jeminUserResponse);

        await apiClient.deleteUser(jayUserID);
      } catch (err) {
        // shouldn't fail here
        fail(err.toString());
      }
    });
    it('saveUser prohibits a blank userID', async () => {
      try {
        await apiClient.saveUser( { userID: '' });
        fail('saveUser should throw an error if userID is an empty string');
      } catch (err) {
        // OK
      }
    });
    it('getUser prohibits a blank userID', async () => {
      try {
        await apiClient.saveUser( { userID: '' });
        fail('getUser should throw an error if userID is an empty string');
      } catch (err) {
        // OK
      }
    });
  });
});
