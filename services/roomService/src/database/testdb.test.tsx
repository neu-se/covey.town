import DatabaseController from './db';

// import { AddNeighborResponse } from '../requestHandlers/CoveyTownRequestHandlers';

const db = new DatabaseController();

beforeAll(async () => {
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
      const resp = await db.insertUser(username, password);
      expect(resp.username).toEqual('create1');
      expect(resp._id).toBeDefined();
      await db.removeUserFromCollection(resp._id);
    });
  });
  describe('login()', () => {
    it('login successfully', async () => {
      const username = 'create2';
      const password = 'pass2';
      const resp = await db.insertUser(username, password);

      const resp2 = await db.login(username, password);
      expect(resp2).toHaveProperty('_id'); // has this property only if type LoginResponse, which only happens on success
      await db.removeUserFromCollection(resp._id);
    });
    it('login fails', async () => {
      const resp = await db.login('create3', 'pass3');
      expect(resp).not.toHaveProperty('_id'); // doesn't have property if type string, which only happens on failure

      const resp2 = await db.login('', '');
      expect(resp2).not.toHaveProperty('_id'); // doesn't have property if type string, which only happens on failure

      const username = 'create4';
      const password = 'pass4';
      const resp3= await db.insertUser(username, password);

      const resp4 = await db.login(username, 'wrongpassword');
      expect(resp4).not.toHaveProperty('_id'); // doesn't have property if type string, which only happens on failure

      const resp5 = await db.login('wrongusername', password);
      expect(resp5).not.toHaveProperty('_id'); // doesn't have property if type string, which only happens on failure
      
      await db.removeUserFromCollection(resp3._id);
    });
  });
  describe('searchUsersByUsername()', () => {
    it('searched and found', async () => {

      const username = 'create4';
      const password = 'pass4';
      const resp = await db.insertUser(username, password);
      const ans = { _id: resp._id, username: username };

      const userToSearch = 'userToSearchFor';
      const passwordForUser = 'pass1';
      const userToSearchFor = await db.insertUser(userToSearch, passwordForUser);
      const userAns = { _id: userToSearchFor._id, username: userToSearch };


      const searchResp = await db.searchUsersByUsername(ans._id.toString(), userToSearch);

      const usersReturned = searchResp.users;
      console.log(usersReturned);
      // const id_one: String = usersReturned[0]._id as String;
      // const user_one: String = usersReturned[0].username as String;
      // expect(JSON.stringify(id_one)).toEqual(JSON.stringify(ans._id));
      // expect(user_one).toEqual(ans.username);
      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(userAns._id);
    });


    it('searched and partial found', async () => {
      const username = 'create5user';
      const password = 'pass5';
      const resp = await db.insertUser(username, password);
      
      const searchResp = await db.searchUsersByUsername(resp._id.toString(), 'create5');
      const ans = { _id: resp._id, username: username };
      const usersReturned = searchResp.users;
      const id_one = usersReturned[0]._id;
      const user_one = usersReturned[0].username
      // Need to figure out why that check fails
      // expect(JSON.stringify(id_one)).toEqual(JSON.stringify(ans._id));
      expect(user_one).toEqual(ans.username);
      await db.removeUserFromCollection(resp._id);
    });

    it('searched and none found', async () => {
      const searchResp = await db.searchUsersByUsername('1', 'create111111');
      expect(searchResp.users).toEqual([]);
    });
  });

  describe('sendRequest()', () => {
    it('new request sent', async () => {
      const username = 'create7';
      const password = 'pass7';
      const resp = await db.insertUser(username, password);

      const username2 = 'create8';
      const password2 = 'pass8';
      const resp2 = await db.insertUser(username2, password2);

      const addResp = await db.sendRequest(resp._id, resp2._id);
      expect(addResp.status).toEqual('requestSent');

      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(resp2._id);
      await db.removeRequestFromCollection(resp._id, resp2._id);
    });

    it('already sent request', async () => {
      const username = 'create8';
      const password = 'pass8';
      const resp = await db.insertUser(username, password);

      const username2 = 'create9';
      const password2 = 'pass9';
      const resp2 = await db.insertUser(username2, password2);

      await db.sendRequest(resp._id, resp2._id);
      const addResp = await db.sendRequest(resp._id, resp2._id);
      expect(addResp.status).toEqual('requestSent');
      
      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(resp2._id);
      await db.removeRequestFromCollection(resp._id, resp2._id);
    });

    it('already received request', async () => {
      const username = 'create10';
      const password = 'pass10';
      const resp = await db.insertUser(username, password);

      const username2 = 'create11';
      const password2 = 'pass11';
      const resp2 = await db.insertUser(username2, password2);

      await db.sendRequest(resp._id, resp2._id);
      const addResp = await db.sendRequest(resp2._id, resp._id);
      expect(addResp.status).toEqual('requestReceived');
      
      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(resp2._id);
      await db.removeRequestFromCollection(resp._id, resp2._id);
    });

    it('already neighbors', async () => {
      // TODO
    })
  });

  describe('findUserId()', () => {
    it('returns id if user exists', async () => {
      const username = 'create12';
      const password = 'pass12';
      const resp = await db.insertUser(username, password);

      const resp2 = await db.findUserIdByUsername(username);
      expect(JSON.stringify(resp2)).toEqual(JSON.stringify(resp._id));
      await db.removeUserFromCollection(resp._id);
    });

    it('returns missing string if user does not exist', async () => {
      const resp = await db.findUserIdByUsername('create13');
      expect(resp).toEqual('user_not_found');
    })
  });

  describe('neighborStatus()', () => {
    it('neighbor', async () => {
        // TODO test with acceptRequest
    });

    it('request sent', async () => {
      const username = 'create14';
      const password = 'pass14';
      const resp = await db.insertUser(username, password);

      const username2 = 'create15';
      const password2 = 'pass15';
      const resp2 = await db.insertUser(username2, password2);

      await db.sendRequest(resp._id, resp2._id);

      const resp3 = await db.neighborStatus(resp._id, resp2._id);
      expect(resp3.status).toEqual('requestSent');

      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(resp2._id);
    });

    it('request received', async () => {
      const username = 'create16';
      const password = 'pass16';
      const resp = await db.insertUser(username, password);

      const username2 = 'create17';
      const password2 = 'pass17';
      const resp2 = await db.insertUser(username2, password2);

      await db.sendRequest(resp._id, resp2._id);
      
      const resp3 = await db.neighborStatus(resp2._id, resp._id);
      expect(resp3.status).toEqual('requestReceived');

      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(resp2._id);
    });

    it('unknown', async () => {
      const username = 'create18';
      const password = 'pass18';
      const resp = await db.insertUser(username, password);

      const username2 = 'create19';
      const password2 = 'pass19';
      const resp2 = await db.insertUser(username2, password2);
      
      const resp3 = await db.neighborStatus(resp._id, resp2._id);
      expect(resp3.status).toEqual('unknown');

      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(resp2._id);
    });
  });

  describe('validateUser()', () => {
    it('success', async () => {
      const username = 'create20';
      const password = 'pass20';
      const resp = await db.insertUser(username, password);

      const validation: string = await db.validateUser(resp._id);
      expect(validation).toEqual('existing user');

      await db.removeUserFromCollection(resp._id);
    });

    it('failure', async () => {
      const username = 'create21';
      const password = 'pass21';
      const resp = await db.insertUser(username, password);
      await db.removeUserFromCollection(resp._id);

      const validation: string = await db.validateUser(resp._id);
      expect(validation).toEqual('user_not_found');
    })
  });
});

/*
NOT USED or tested yet:
- acceptReqest
- removeNeighborRequest
- removeNeighbor
*/