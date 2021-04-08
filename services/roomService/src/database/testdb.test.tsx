import DatabaseController from './db';

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
      const id_one: String = usersReturned[0]._id as String;
      const user_one: String = usersReturned[0].username as String;
      expect(JSON.stringify(id_one)).toEqual(JSON.stringify(userToSearchFor._id));
      expect(user_one).toEqual(userToSearchFor.username);
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
      expect(JSON.stringify(id_one)).toEqual(JSON.stringify(ans._id));
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
      const username = 'create32';
      const password = 'pass32';
      const resp = await db.insertUser(username, password);

      const username2 = 'create33';
      const password2 = 'pass33';
      const resp2 = await db.insertUser(username2, password2);

      await db.sendRequest(resp._id, resp2._id);
      await db.acceptRequest(resp2._id, resp._id);
      
      const resp3 = await db.sendRequest(resp._id, resp2._id);
      expect(resp3.status).toEqual('neighbor');

      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(resp2._id);
      await db.removeMappingFromCollection(resp._id, resp2._id);
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
      const username = 'create30';
      const password = 'pass30';
      const resp = await db.insertUser(username, password);

      const username2 = 'create31';
      const password2 = 'pass31';
      const resp2 = await db.insertUser(username2, password2);

      await db.sendRequest(resp._id, resp2._id);
      await db.acceptRequest(resp2._id, resp._id);
      
      const resp3 = await db.neighborStatus(resp._id, resp2._id);
      expect(resp3.status).toEqual('neighbor');

      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(resp2._id);
      await db.removeMappingFromCollection(resp._id, resp2._id);
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

  describe('acceptRequest()', () => { // all of them expect a neighbor status
    it('successfully accepted request', async () => {
      const username = 'create22';
      const password = 'pass22';
      const resp = await db.insertUser(username, password);

      const username2 = 'create23';
      const password2 = 'pass23';
      const resp2 = await db.insertUser(username2, password2);

      await db.sendRequest(resp._id, resp2._id);
      
      const resp3 = await db.acceptRequest(resp2._id, resp._id);
      expect(resp3.status).toEqual('neighbor');

      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(resp2._id);
      await db.removeMappingFromCollection(resp._id, resp2._id);
    });

    it('already neighbors so cannot accept', async () => {
      const username = 'create24';
      const password = 'pass24';
      const resp = await db.insertUser(username, password);

      const username2 = 'create25';
      const password2 = 'pass25';
      const resp2 = await db.insertUser(username2, password2);

      await db.sendRequest(resp._id, resp2._id);
      
      await db.acceptRequest(resp2._id, resp._id);
      const resp3 = await db.acceptRequest(resp2._id, resp._id); // repeat call
      expect(resp3.status).toEqual('neighbor');

      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(resp2._id);
      await db.removeMappingFromCollection(resp._id, resp2._id);
    });

    it('request was sent (not received) so cannot accept', async () => {
      const username = 'create26';
      const password = 'pass26';
      const resp = await db.insertUser(username, password);

      const username2 = 'create27';
      const password2 = 'pass27';
      const resp2 = await db.insertUser(username2, password2);

      await db.sendRequest(resp._id, resp2._id);
      
      const resp3 = await db.acceptRequest(resp._id, resp2._id);
      expect(resp3.status).toEqual('requestSent');

      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(resp2._id);
      await db.removeRequestFromCollection(resp._id, resp2._id);
    });

    it('unknown relationship so cannot accept', async () => {
      const username = 'create28';
      const password = 'pass28';
      const resp = await db.insertUser(username, password);

      const username2 = 'create29';
      const password2 = 'pass29';
      const resp2 = await db.insertUser(username2, password2);
      
      const resp3 = await db.acceptRequest(resp._id, resp2._id);
      expect(resp3.status).toEqual('unknown');

      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(resp2._id);
    });
  });

  describe('removeNeighborRequest()', () => { 
    it('successfully removed a sent request', async () => { // should return unknown
      const username = 'create34';
      const password = 'pass34';
      const resp = await db.insertUser(username, password);

      const username2 = 'create35';
      const password2 = 'pass35';
      const resp2 = await db.insertUser(username2, password2);

      await db.sendRequest(resp._id, resp2._id);
      
      const resp3 = await db.removeNeighborRequest(resp._id, resp2._id);
      expect(resp3.status).toEqual('unknown');

      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(resp2._id);
    });

    it('neighbors already so no request to remove', async () => {
      const username = 'create36';
      const password = 'pass36';
      const resp = await db.insertUser(username, password);

      const username2 = 'create37';
      const password2 = 'pass37';
      const resp2 = await db.insertUser(username2, password2);

      await db.sendRequest(resp._id, resp2._id);
      await db.acceptRequest(resp2._id, resp._id);

      const resp3 = await db.removeNeighborRequest(resp._id, resp2._id);
      expect(resp3.status).toEqual('neighbor');

      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(resp2._id);
      await db.removeMappingFromCollection(resp._id, resp2._id);
    });

    it('request was received so cannot remove', async () => {
      const username = 'create38';
      const password = 'pass38';
      const resp = await db.insertUser(username, password);

      const username2 = 'create39';
      const password2 = 'pass39';
      const resp2 = await db.insertUser(username2, password2);

      await db.sendRequest(resp._id, resp2._id);
      
      const resp3 = await db.removeNeighborRequest(resp2._id, resp._id);
      expect(resp3.status).toEqual('requestReceived');

      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(resp2._id);
      await db.removeRequestFromCollection(resp._id, resp2._id);
    });

    it('unknown relationship so no request to remove', async () => {
      const username = 'create40';
      const password = 'pass40';
      const resp = await db.insertUser(username, password);

      const username2 = 'create41';
      const password2 = 'pass41';
      const resp2 = await db.insertUser(username2, password2);
      
      const resp3 = await db.removeNeighborRequest(resp._id, resp2._id);
      expect(resp3.status).toEqual('unknown');

      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(resp2._id);
    });
  });

  describe('removeNeighbor()', () => { 
    it('successfully removed an existing neighbor mapping way 1', async () => { // should return unknown
      const username = 'create42';
      const password = 'pass42';
      const resp = await db.insertUser(username, password);

      const username2 = 'create43';
      const password2 = 'pass43';
      const resp2 = await db.insertUser(username2, password2);

      await db.sendRequest(resp._id, resp2._id);
      await db.acceptRequest(resp2._id, resp._id);

      const resp3 = await db.removeNeighbor(resp._id, resp2._id);
      expect(resp3.status).toEqual('unknown');

      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(resp2._id);
    });

    it('successfully removed an existing neighbor mapping way 2', async () => { // should return unknown
      const username = 'create44';
      const password = 'pass44';
      const resp = await db.insertUser(username, password);

      const username2 = 'create45';
      const password2 = 'pass45';
      const resp2 = await db.insertUser(username2, password2);

      await db.sendRequest(resp._id, resp2._id);
      await db.acceptRequest(resp2._id, resp._id);

      const resp3 = await db.removeNeighbor(resp2._id, resp._id);
      expect(resp3.status).toEqual('unknown');

      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(resp2._id);
    });

    it('requestSent relationship so no neighbor mapping to remove', async () => { 
      const username = 'create46';
      const password = 'pass46';
      const resp = await db.insertUser(username, password);

      const username2 = 'create47';
      const password2 = 'pass47';
      const resp2 = await db.insertUser(username2, password2);

      await db.sendRequest(resp._id, resp2._id);

      const resp3 = await db.removeNeighbor(resp._id, resp2._id);
      expect(resp3.status).toEqual('requestSent');

      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(resp2._id);
      await db.removeRequestFromCollection(resp._id, resp2._id);
    });

    it('requestReceived relationship so no neighbor mapping to remove', async () => { 
      const username = 'create48';
      const password = 'pass48';
      const resp = await db.insertUser(username, password);

      const username2 = 'create49';
      const password2 = 'pass49';
      const resp2 = await db.insertUser(username2, password2);

      await db.sendRequest(resp2._id, resp._id);

      const resp3 = await db.removeNeighbor(resp._id, resp2._id);
      expect(resp3.status).toEqual('requestReceived');

      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(resp2._id);
      await db.removeRequestFromCollection(resp2._id, resp._id);
    });

    it('unknown relationship so no neighbor mapping to remove', async () => { 
      const username = 'create50';
      const password = 'pass50';
      const resp = await db.insertUser(username, password);

      const username2 = 'create51';
      const password2 = 'pass51';
      const resp2 = await db.insertUser(username2, password2);

      const resp3 = await db.removeNeighbor(resp._id, resp2._id);
      expect(resp3.status).toEqual('unknown');

      await db.removeUserFromCollection(resp._id);
      await db.removeUserFromCollection(resp2._id);
    });
  });
  describe('listingMethods()', () => {
    it('returns empty list for id with no neighbors', async () => {
      const userId = '1';
      const list = await db.listNeighbors(userId);

      expect(list.users.length).toEqual(0);

    });
    it('returns empty list for id with no requests sent', async () => {
      const userId = '1';
      const list = await db.listRequestsSent(userId);

      expect(list.users.length).toEqual(0);

    });
    it('returns empty list for id with no requests received', async () => {
      const userId = '1';
      const list = await db.listRequestsReceived(userId);

      expect(list.users.length).toEqual(0);

    });
    it('returns a id and username for each neighbor', async () => {
      const userId1 = '6063abfc7a797cb3923c3195';
      const userId2 = '6063ac3c7a797cb3923c3197';

      const neighborList1 = await db.listNeighbors(userId1);
      const neighborList2 = await db.listNeighbors(userId2);

      const neighbors1 = neighborList1.users;
      expect(neighbors1[0]._id.toString()).toEqual(userId2);

      const neighbors2 = neighborList2.users;
      expect(neighbors2[0]._id.toString()).toEqual(userId1);
    });
    it('returns a id and username for each request sent', async () => {
      const userId1 = '6065e4fbaa247a984be6a590';
      const userId2 = '6065e50faa247a984be6a591';

      const requestSentList = await db.listRequestsSent(userId1);

      expect(requestSentList.users[0]._id.toString()).toEqual(userId2);

    });

    it('returns a id and username for each request sent', async () => {
      const userId1 = '6065e4fbaa247a984be6a590';
      const userId2 = '6065e50faa247a984be6a591';

      const requestsReceivedList = await db.listRequestsReceived(userId2);

      expect(requestsReceivedList.users[0]._id.toString()).toEqual(userId1);

    });
  });
});

/*
NOT tested yet:
- FIX THE NEIGHBOR STUFF IN TEST HANDLERS after acceptRequest handler implemented
*/
