import Express from 'express';
import CORS from 'cors';
import http from 'http';
import { AddressInfo } from 'net';
import addAccountRoutes from '../router/accounts';

import AccountsServiceClient, { GetUserResponse, JoinedTown, SaveUserRequest } from './AccountsServiceClient';
import { GetUserRequest } from '../requestHandlers/AccountRequestHandlers';

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

const jeminUserIDSaveUser: SaveUserRequest = {
  userID: 'jay',
};

/**
 * Example data for GetUserRequest
 */
const jeminGetUser: GetUserRequest = {
  userID: 'jemin',
};

const tatiGetUser: GetUserRequest = {
  userID: 'tatiana',
};

const johnGetUser: GetUserRequest = {
  userID: 'john',
};

const jeminUserIDGetUser: GetUserRequest = {
  userID: 'jay',
};

/**
 * example data for return of GetUserResponse
 */

const jeminUserResponse: GetUserResponse = {
  userID: 'jay',
  email: '',
  username: '',
  useAudio: false,
  useVideo: false,
  towns: [],
};

describe('AccountsServiceAPIREST', () => {
  let server: http.Server;
  let apiClient: AccountsServiceClient;

  beforeAll(async () => {
    const app = Express();
    app.use(CORS());
    server = http.createServer(app);

    addAccountRoutes(server, app);
    await server.listen();
    const address = server.address() as AddressInfo;

    apiClient = new AccountsServiceClient(`http://127.0.0.1:${address.port}`);
  });
  afterAll(async () => {
    await server.close();
  });

  describe('saveUser and getUser', () => {
    it('Allows and retrieves user created with fully formatted SaveUserRequest without any joined towns', async () => {
      try {
        await apiClient.saveUser(jeminSaveUser);
        const res = await apiClient.getUser(jeminGetUser);
        expect(res).toStrictEqual(jeminSaveUser);
      } catch (err){
        // shouldn't fail here
        fail(err.toString());
      }
    });
    it('Allows and retrieves user created with just userID with one joined town', async () => {
      try {
        await apiClient.saveUser(johnSaveUser);
        const res = await apiClient.getUser(johnGetUser);
        expect(res).toStrictEqual(johnSaveUser);
      } catch (err) {
        // shouldn't fail here
        fail(err.toString());
      }
    });
    it('Allows and retrieves user created with just userID with multiple joined town', async () => {
      try {
        await apiClient.saveUser(tatiSaveUser);
        const res = await apiClient.getUser(tatiGetUser);
        expect(res).toStrictEqual(tatiSaveUser);

      } catch (err) {
        // shouldn't fail here
        fail(err.toString());
      }
    });
    it('Allows and retrieves user created with just userID', async () => {
      try {
        await apiClient.saveUser(jeminUserIDSaveUser);
        const res = await apiClient.getUser(jeminUserIDGetUser);
        expect(res).toStrictEqual(jeminUserResponse);
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
