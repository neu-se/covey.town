import DatabaseController, {AccountCreateResponse, LoginResponse, SearchUsersResponse} from './db';
import {AddNeighborResponse } from '../requestHandlers/CoveyTownRequestHandlers';

let db: DatabaseController;

beforeAll(async () => {
  db = new DatabaseController();
  await db.connect();
});

afterAll(() => {
  db.close();
});

describe('db', () => {
  describe('insertUser()', () => {
    it('inserts successfully', async () => {
      const username = 'create1';
      const password = 'pass1';
      const resp: AccountCreateResponse = await db.insertUser(username, password);
      expect(resp.username).toEqual('create1');
      expect(resp._id).toBeDefined();
      console.log(resp._id);
      await db.removeUserFromCollection(resp._id);
    });
  });
  describe('login()', () => {
    it('login successfully', async () => {
      const username = 'create2';
      const password = 'pass2';
      const resp: AccountCreateResponse = await db.insertUser(username, password);

      const resp2: LoginResponse|string = await db.login(username, password);
      expect(resp2).toHaveProperty('_id'); // has this property only if type LoginResponse, which only happens on success
      await db.removeUserFromCollection(resp._id);
    });
    it('login fails', async () => {
      const resp: LoginResponse|string = await db.login('create3', 'pass3');
      expect(resp).not.toHaveProperty('_id'); // doesn't have property if type string, which only happens on failure

      const resp2: LoginResponse|string = await db.login('', '');
      expect(resp2).not.toHaveProperty('_id'); // doesn't have property if type string, which only happens on failure

      const username = 'create4';
      const password = 'pass4';
      const resp3: AccountCreateResponse = await db.insertUser(username, password);

      const resp4: LoginResponse|string = await db.login(username, 'wrongpassword');
      expect(resp4).not.toHaveProperty('_id'); // doesn't have property if type string, which only happens on failure

      const resp5: LoginResponse|string = await db.login('wrongusername', password);
      expect(resp5).not.toHaveProperty('_id'); // doesn't have property if type string, which only happens on failure
      
      await db.removeUserFromCollection(resp3._id);
    });
  });
  describe('searchUsersByUsername()', () => {
    // TODO FIX
    it('searched and found', async () => {
      const username = 'create4';
      const password = 'pass4';
      const resp: AccountCreateResponse = await db.insertUser(username, password);
      
      const searchResp: SearchUsersResponse = await db.searchUsersByUsername(username);
      const ans = { _id: resp._id, username: username };
      const usersReturned = searchResp.users;
      const id_one = usersReturned[0]._id;
      console.log(id_one);
      const user_one = usersReturned[0].username;
      console.log(user_one);
      expect(id_one).toEqual(ans._id);
      expect(user_one).toEqual(ans.username);

      await db.removeUserFromCollection(resp._id);
    });

    // TODO FIX same error
    it('searched and partial found', async () => {
      const username = 'create5user';
      const password = 'pass5';
      const resp: AccountCreateResponse = await db.insertUser(username, password);
      
      const searchResp: SearchUsersResponse = await db.searchUsersByUsername('create5');
      const ans = { _id: resp._id, username: username };
      console.log(searchResp.users);
      expect(searchResp.users).toContainEqual(ans);

      await db.removeUserFromCollection(resp._id);
    });

    it('searched and none found', async () => {
      const searchResp: SearchUsersResponse = await db.searchUsersByUsername('create6');
      expect(searchResp.users).toEqual([]);
    });
  });

  describe('sendRequest()', () => {
    it('new request sent', async () => {
      const username = 'create7';
      const password = 'pass7';
      const resp: AccountCreateResponse = await db.insertUser(username, password);

      const username2 = 'create8';
      const password2 = 'pass8';
      const resp2: AccountCreateResponse = await db.insertUser(username2, password2);

      const addResp: AddNeighborResponse = await db.sendRequest(resp._id, resp2._id);
      expect(addResp.status).toEqual('requestSent');

      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(resp2._id);
    });

    it('already sent request', async () => {
      const username = 'create8';
      const password = 'pass8';
      const resp: AccountCreateResponse = await db.insertUser(username, password);

      const username2 = 'create9';
      const password2 = 'pass9';
      const resp2: AccountCreateResponse = await db.insertUser(username2, password2);

      await db.sendRequest(resp._id, resp2._id);
      const addResp: AddNeighborResponse = await db.sendRequest(resp._id, resp2._id);
      expect(addResp.status).toEqual('requestSent');
      
      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(resp2._id);
    });

    it('already received request', async () => {
      const username = 'create10';
      const password = 'pass10';
      const resp: AccountCreateResponse = await db.insertUser(username, password);

      const username2 = 'create11';
      const password2 = 'pass11';
      const resp2: AccountCreateResponse = await db.insertUser(username2, password2);

      await db.sendRequest(resp._id, resp2._id);
      const addResp: AddNeighborResponse = await db.sendRequest(resp2._id, resp._id);
      expect(addResp.status).toEqual('requestReceived');
      
      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(resp2._id);
    });
  });
});

/*
Helper Methods to test:
- findUserId
  - returns id if exists and string if it doesn't
- neighborStatus
  - neighbor
  - request sent
  - request received
  - unknown
- checkIfNeighbors
  - true or false

NOT USED:
- acceptReqest
- removeNeighborRequest
- removeNeighbor
*/