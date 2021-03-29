import { AccountCreateRequest, LoginRequest, SearchUsersRequest, 
    AddNeighborRequest, AddNeighborResponse, accountCreateHandler, loginHandler,
    searchUsersByUsername, sendAddNeighborRequest, ResponseEnvelope} from './CoveyTownRequestHandlers';
import DatabaseController, {AccountCreateResponse, LoginResponse, SearchUsersResponse} from '../database/db';

let db: DatabaseController;

beforeAll(async () => {
  db = new DatabaseController();
  await db.connect();
});

afterAll(() => {
    db.close();
});

describe('CoveyTownRequestHandlers', () => {
    describe('accountCreateHandler()', () => {
        it('creates successfully', async () => {
            const username = 'create1';
            const password = 'create1pass';
            const req: AccountCreateRequest = { username: username, password: password };
            const resp: ResponseEnvelope<AccountCreateResponse> = await accountCreateHandler(req);

            expect(resp.isOK).toBeTruthy();

            if (resp.response) { 
                expect(resp.response._id).toBeDefined();
                expect(resp.response.username).toEqual(username);
                await db.removeUserFromCollection(resp.response._id);
            } else {
                throw Error('this failed when it should be passing');
            }
        });

        it('fails to create successfully', async () => {
            const req1: AccountCreateRequest = { username: 'create2', password: '' }; // should fail on 'invalid password'
            const req2: AccountCreateRequest = { username: 'create3', password: 'create3pass' }; // should successfully get in
            const req3: AccountCreateRequest = { username: 'create3', password: 'create3pass2' }; // should fail on 'username taken'
           
            const resp1: ResponseEnvelope<AccountCreateResponse> = await accountCreateHandler(req1);
            expect(resp1.isOK).toBeFalsy();
            if (resp1.message) { 
                expect(resp1.message).toEqual('Invalid Password');
            } else {
                throw Error('this failed when it should be passing');
            }

            const resp2: ResponseEnvelope<AccountCreateResponse> = await accountCreateHandler(req2);
            expect(resp2.isOK).toBeTruthy();

            const resp3: ResponseEnvelope<AccountCreateResponse> = await accountCreateHandler(req3);
            expect(resp3.isOK).toBeFalsy();
            if (resp3.message) { 
                expect(resp3.message).toEqual('Username Taken');
            } else {
                throw Error('this failed when it should be passing');
            }

            if (resp2.response) {
                await db.removeUserFromCollection(resp2.response._id);
            } else {
                throw Error('this failed when it should be passing');
            }
        });
    });

    describe('loginToAccount()', () => {
        it('login successfully', async () => {
            const username = 'create4';
            const password = 'create4pass';
            const req: AccountCreateRequest = { username: username, password: password };
            const resp: ResponseEnvelope<AccountCreateResponse> = await accountCreateHandler(req);
            expect(resp.isOK).toBeTruthy();

            const loginReq: LoginRequest = { username: username, password: password };
            const loginResp: ResponseEnvelope<LoginResponse|string> = await loginHandler(loginReq);
            expect(loginResp.isOK).toBeTruthy();
            
            if (loginResp.response) {
                expect(loginResp.response).toHaveProperty('_id');
                expect(loginResp.response).toHaveProperty('username');
            }

            if (resp.response) {
                await db.removeUserFromCollection(resp.response._id);
            } else {
                throw Error('this failed when it should be passing');
            }
        });

        it('fails to login successfully', async () => {
            const loginReq1: LoginRequest = { username: 'create5', password: 'create5pass' };
            const loginResp1: ResponseEnvelope<LoginResponse|string> = await loginHandler(loginReq1);
            expect(loginResp1.isOK).toBeFalsy();
            if (loginResp1.message) {
                expect(loginResp1.message).toEqual('Invalid Username');
            } else {
                throw Error('this failed when it should be passing');
            }

            const loginReq2: LoginRequest = { username: '', password: '' };
            const loginResp2: ResponseEnvelope<LoginResponse|string> = await loginHandler(loginReq2);
            expect(loginResp2.isOK).toBeFalsy();
            if (loginResp2.message) {
                expect(loginResp2.message).toEqual('Invalid Password');
            } else {
                throw Error('this failed when it should be passing');
            }

            const req: AccountCreateRequest = { username: 'create6', password: 'create6pass' };
            const resp: ResponseEnvelope<AccountCreateResponse> = await accountCreateHandler(req);
            expect(resp.isOK).toBeTruthy();

            const loginReq3: LoginRequest = { username: 'create6', password: 'wrongpassword' };
            const loginResp3: ResponseEnvelope<LoginResponse|string> = await loginHandler(loginReq3);
            expect(loginResp3.isOK).toBeFalsy();
            if (loginResp3.message) {
                expect(loginResp3.message).toEqual('Invalid Username and Password');
            } else {
                throw Error('this failed when it should be passing');
            }

            const loginReq4: LoginRequest = { username: 'wrongusername', password: 'create6pass' };
            const loginResp4: ResponseEnvelope<LoginResponse|string> = await loginHandler(loginReq4);
            expect(loginResp4.isOK).toBeFalsy();
            if (loginResp4.message) {
                expect(loginResp4.message).toEqual('Invalid Username');
            } else {
                throw Error('this failed when it should be passing');
            }

            if (resp.response) {
                await db.removeUserFromCollection(resp.response._id);
            } else {
                throw Error('this failed when it should be passing');
            }
        });
    });

    describe('searchForUsersByUsername()', () => {
        it('searched and found', async () => {
            const req: AccountCreateRequest = { username: 'create7', password: 'create7pass' };
            const resp: ResponseEnvelope<AccountCreateResponse> = await accountCreateHandler(req);
            expect (resp.isOK).toBeTruthy();

            const searchReq: SearchUsersRequest = { username: 'create7' };
            const searchResp: ResponseEnvelope<SearchUsersResponse> = await searchUsersByUsername(searchReq);
            expect(searchResp.isOK).toBeTruthy();
            if (searchResp.response && resp.response) {
                const ans = { _id: resp.response._id, username: 'create7' }
                const usersReturned = searchResp.response.users;
                const id_one: String = usersReturned[0]._id as String;
                const user_one: String = usersReturned[0].username as String;
                expect(JSON.stringify(id_one)).toEqual(JSON.stringify(ans._id));
                expect(user_one).toEqual(ans.username);
            } else {
                throw Error('this failed when it should be passing');
            }

            if (resp.response) {
                await db.removeUserFromCollection(resp.response._id);
            } else {
                throw Error('this failed when it should be passing');
            }
        });

        it('searched and partial found', async () => {
            const req: AccountCreateRequest = { username: 'create8user', password: 'create8pass' };
            const resp: ResponseEnvelope<AccountCreateResponse> = await accountCreateHandler(req);
            expect(resp.isOK).toBeTruthy();

            const searchReq: SearchUsersRequest = { username: 'create8' };
            const searchResp: ResponseEnvelope<SearchUsersResponse> = await searchUsersByUsername(searchReq);
            expect(searchResp.isOK).toBeTruthy();
            if (searchResp.response && resp.response) {
                const ans = { _id: resp.response._id, username: 'create8user' }
                const usersReturned = searchResp.response.users;
                const id_one: String = usersReturned[0]._id as String;
                const user_one: String = usersReturned[0].username as String;
                expect(JSON.stringify(id_one)).toEqual(JSON.stringify(ans._id));
                expect(user_one).toEqual(ans.username);
            } else {
                throw Error('this failed when it should be passing');
            }

            if (resp.response) {
                await db.removeUserFromCollection(resp.response._id);
            } else {
                throw Error('this failed when it should be passing');
            }
        });

        it('searched and none found', async () => {
            const searchReq: SearchUsersRequest = { username: 'create9' };
            const searchResp: ResponseEnvelope<SearchUsersResponse> = await searchUsersByUsername(searchReq);
            expect(searchResp.isOK).toBeTruthy();
            if (searchResp.response) {
                expect(searchResp.response.users).toEqual([]);
            } else {
                throw Error('this failed when it should be passing');
            }
        });
    });

    describe('sendAddNeighborRequest()', () => {

        it('new request sent', async () => {
            const req: AccountCreateRequest = { username: 'create10user', password: 'create10pass' };
            const resp: ResponseEnvelope<AccountCreateResponse> = await accountCreateHandler(req);
            expect(resp.isOK).toBeTruthy();

            const req2: AccountCreateRequest = { username: 'create11user', password: 'create11pass' };
            const resp2: ResponseEnvelope<AccountCreateResponse> = await accountCreateHandler(req2);
            expect(resp2.isOK).toBeTruthy();

            if (resp.response && resp2.response) {
                const neighborReq: AddNeighborRequest = { currentUserId: resp.response._id, UserIdToRequest: resp2.response._id };
                const neighborResp: ResponseEnvelope<AddNeighborResponse> = await sendAddNeighborRequest(neighborReq);
                expect(neighborResp.isOK).toBeTruthy();
                if (neighborResp.response) {
                    expect(neighborResp.response.status).toEqual('requestSent');
                } else {
                    throw Error('this failed when it should be passing');
                }
                await db.removeUserFromCollection(resp.response._id);
                await db.removeUserFromCollection(resp2.response._id);
                await db.removeRequestFromCollection(resp.response._id, resp2.response._id);
            } else {
                throw Error('this failed when it should be passing');
            }
        });

        it('sending user was not found', async () => {

            const req: AccountCreateRequest = { username: 'create12user', password: 'create12pass' };
            const resp: ResponseEnvelope<AccountCreateResponse> = await accountCreateHandler(req);
            expect(resp.isOK).toBeTruthy();

            const req2: AccountCreateRequest = { username: 'create13user', password: 'create13pass' };
            const resp2: ResponseEnvelope<AccountCreateResponse> = await accountCreateHandler(req2);
            expect(resp2.isOK).toBeTruthy();

            if (resp.response && resp2.response) {
                await db.removeUserFromCollection(resp.response._id);
                const neighborReq: AddNeighborRequest = { currentUserId: resp.response._id, UserIdToRequest: resp2.response._id };
                const neighborResp: ResponseEnvelope<AddNeighborResponse> = await sendAddNeighborRequest(neighborReq);
                expect(neighborResp.isOK).toBeFalsy();
                if (neighborResp.message) {
                    expect(neighborResp.message).toEqual('Sending User Not Found');
                } else {
                    throw Error('this failed when it should be passing');
                }
                await db.removeUserFromCollection(resp2.response._id);
            } else {
                throw Error('this failed when it should be passing');
            }
        });

        it('receiving user was not found', async () => {
            const req: AccountCreateRequest = { username: 'create14user', password: 'create14pass' };
            const resp: ResponseEnvelope<AccountCreateResponse> = await accountCreateHandler(req);
            expect(resp.isOK).toBeTruthy();

            const req2: AccountCreateRequest = { username: 'create15user', password: 'create15pass' };
            const resp2: ResponseEnvelope<AccountCreateResponse> = await accountCreateHandler(req2);
            expect(resp2.isOK).toBeTruthy();

            if (resp.response && resp2.response) {
                await db.removeUserFromCollection(resp2.response._id);
                const neighborReq: AddNeighborRequest = { currentUserId: resp.response._id, UserIdToRequest: resp2.response._id };
                const neighborResp: ResponseEnvelope<AddNeighborResponse> = await sendAddNeighborRequest(neighborReq);
                expect(neighborResp.isOK).toBeFalsy();
                if (neighborResp.message) {
                    expect(neighborResp.message).toEqual('Receiving User Not Found');
                } else {
                    throw Error('this failed when it should be passing');
                }
                await db.removeUserFromCollection(resp.response._id);
            } else {
                throw Error('this failed when it should be passing');
            }
        });

        it('already sent request', async () => {
            const req: AccountCreateRequest = { username: 'create16user', password: 'create16pass' };
            const resp: ResponseEnvelope<AccountCreateResponse> = await accountCreateHandler(req);
            expect(resp.isOK).toBeTruthy();

            const req2: AccountCreateRequest = { username: 'create17user', password: 'create17pass' };
            const resp2: ResponseEnvelope<AccountCreateResponse> = await accountCreateHandler(req2);
            expect(resp2.isOK).toBeTruthy();

            if (resp.response && resp2.response) {
                const neighborReq: AddNeighborRequest = { currentUserId: resp.response._id, UserIdToRequest: resp2.response._id };
                const neighborResp: ResponseEnvelope<AddNeighborResponse> = await sendAddNeighborRequest(neighborReq);
                const neighborResp2: ResponseEnvelope<AddNeighborResponse> = await sendAddNeighborRequest(neighborReq);
                expect(neighborResp.isOK).toBeTruthy();
                expect(neighborResp2.isOK).toBeTruthy();
                if (neighborResp2.response) {
                    expect(neighborResp2.response.status).toEqual('requestSent');
                } else {
                    throw Error('this failed when it should be passing');
                }
                await db.removeUserFromCollection(resp.response._id);
                await db.removeUserFromCollection(resp2.response._id);
                await db.removeRequestFromCollection(resp.response._id, resp2.response._id);
            } else {
                throw Error('this failed when it should be passing');
            }
        });

        it('already received request', async () => {
            const req: AccountCreateRequest = { username: 'create18user', password: 'create18pass' };
            const resp: ResponseEnvelope<AccountCreateResponse> = await accountCreateHandler(req);
            expect(resp.isOK).toBeTruthy();

            const req2: AccountCreateRequest = { username: 'create19user', password: 'create19pass' };
            const resp2: ResponseEnvelope<AccountCreateResponse> = await accountCreateHandler(req2);
            expect(resp2.isOK).toBeTruthy();

            if (resp.response && resp2.response) {
                const neighborReq: AddNeighborRequest = { currentUserId: resp.response._id, UserIdToRequest: resp2.response._id };
                const neighborResp: ResponseEnvelope<AddNeighborResponse> = await sendAddNeighborRequest(neighborReq);
                const neighborResp2: ResponseEnvelope<AddNeighborResponse> = await sendAddNeighborRequest({ currentUserId: resp2.response._id, UserIdToRequest: resp.response._id });
                expect(neighborResp.isOK).toBeTruthy();
                expect(neighborResp2.isOK).toBeTruthy();
                if (neighborResp2.response) {
                    expect(neighborResp2.response.status).toEqual('requestReceived');
                } else {
                    throw Error('this failed when it should be passing');
                }
                await db.removeUserFromCollection(resp.response._id);
                await db.removeUserFromCollection(resp2.response._id);
                await db.removeRequestFromCollection(resp.response._id, resp2.response._id);
            } else {
                throw Error('this failed when it should be passing');
            }
        });

        it('already neighbors', async () => {
            // TODO
        });
    });
  });