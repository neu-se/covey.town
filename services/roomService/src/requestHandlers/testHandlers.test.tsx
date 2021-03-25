import { AccountCreateRequest, LoginRequest, SearchUsersRequest, 
    AddNeighborRequest, AddNeighborResponse, accountCreateHandler, loginHandler,
    searchUsersByUsername, sendAddNeighborRequest, ResponseEnvelope} from './CoveyTownRequestHandlers';
import DatabaseController, {AccountCreateResponse, LoginResponse, SearchUsersResponse} from '../database/db';
import { assert } from 'console';

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

    // describe('loginToAccount()', () => {
    //     it('login successfully', async () => {
    //         const req: AccountCreateRequest = { username: 'create4', password: 'create4pass' };
    //         const resp: AccountCreateResponse = await client.createAccount(req);
    //         expect(resp).resolves.toBeDefined();

    //         const loginReq: LoginRequest = { username: 'create4', password: 'create4pass' };
    //         const loginResp: LoginResponse = await client.loginToAccount(loginReq);
    //         expect(loginResp).resolves.toBeDefined();
    //         expect(loginResp.username).toEqual('create4');
    //         expect(loginResp._id).toBeDefined();
    //     });

    //     it('fails to login successfully', async () => {
    //         const loginReq1: LoginRequest = { username: 'create5', password: 'create5pass' }; // should fail on 'No user with that username and password'
    //         const loginResp1: Promise<LoginResponse> = client.loginToAccount(loginReq1);
    //         expect(loginResp1).rejects.toThrow('Error processing request: No user with that username and password');

    //         const loginReq2: LoginRequest = { username: '', password: '' };
    //         const loginResp2: Promise<LoginResponse> = client.loginToAccount(loginReq2);
    //         expect(loginResp2).rejects.toThrow('Error processing request: No user with that username and password');

    //         const req: AccountCreateRequest = { username: 'create6', password: 'create6pass' };
    //         const resp: AccountCreateResponse = await client.createAccount(req);
    //         expect(resp).resolves.toBeDefined();

    //         const loginReq3: LoginRequest = { username: 'create6', password: 'wrongpassword' };
    //         const loginResp3: LoginResponse = await client.loginToAccount(loginReq3);
    //         expect(loginResp3).rejects.toThrow('Error processing request: No user with that username and password');

    //         const loginReq4: LoginRequest = { username: 'wrongusername', password: 'create6pass' };
    //         const loginResp4: LoginResponse = await client.loginToAccount(loginReq4);
    //         expect(loginResp4).rejects.toThrow('Error processing request: No user with that username and password');
    //     });
    // });

    // describe('searchForUsersByUsername()', () => {
    //     it('searched and found', async () => {
    //         const req: AccountCreateRequest = { username: 'create7', password: 'create7pass' };
    //         const resp: AccountCreateResponse = await client.createAccount(req);
    //         expect(resp).resolves.toBeDefined();

    //         const searchReq: SearchUsersRequest = { username: 'create7' };
    //         const searchResp: SearchUsersResponse = await client.searchForUsersByUsername(searchReq);
    //         expect(searchResp).resolves.toBeDefined();
    //         expect(searchResp.users).toContainEqual(expect.objectContaining({ _id: resp._id, username: 'create7' }));
    //     });

    //     it('searched and partial found', async () => {
    //         const req: AccountCreateRequest = { username: 'create8user', password: 'create8pass' };
    //         const resp: AccountCreateResponse = await client.createAccount(req);
    //         expect(resp).resolves.toBeDefined();

    //         const searchReq: SearchUsersRequest = { username: 'create8' };
    //         const searchResp: SearchUsersResponse = await client.searchForUsersByUsername(searchReq);
    //         expect(searchResp).resolves.toBeDefined();
    //         expect(searchResp.users).toContain(expect.objectContaining({ _id: resp._id, username: 'create8user' }));
    //     });

    //     it('searched and none found', async () => {
    //         const searchReq: SearchUsersRequest = { username: 'create9' };
    //         const searchResp: SearchUsersResponse = await client.searchForUsersByUsername(searchReq);
    //         expect(searchResp).resolves.toBeDefined();
    //         expect(searchResp.users).toEqual([]);
    //     });
    // });

    // describe('sendAddNeighborRequest()', () => {

    //     it('new request sent', async () => {
    //         const req: AccountCreateRequest = { username: 'create10user', password: 'create10pass' };
    //         const resp: AccountCreateResponse = await client.createAccount(req);
    //         expect(resp).resolves.toBeDefined();

    //         const req2: AccountCreateRequest = { username: 'create11user', password: 'create11pass' };
    //         const resp2: AccountCreateResponse = await client.createAccount(req2);
    //         expect(resp2).resolves.toBeDefined();

    //         const neighborReq: AddNeighborRequest = { currentUserId: resp._id, UserIdToRequest: resp2._id };
    //         const neighborResp: AddNeighborResponse = await client.sendAddNeighborRequest(neighborReq);
    //         expect(neighborResp.status).toEqual('requestSent');
    //     });

    //     it('already sent request', async () => {
    //         const req: AccountCreateRequest = { username: 'create12user', password: 'create12pass' };
    //         const resp: AccountCreateResponse = await client.createAccount(req);
    //         expect(resp).resolves.toBeDefined();

    //         const req2: AccountCreateRequest = { username: 'create13user', password: 'create13pass' };
    //         const resp2: AccountCreateResponse = await client.createAccount(req2);
    //         expect(resp2).resolves.toBeDefined();

    //         const neighborReq: AddNeighborRequest = { currentUserId: resp._id, UserIdToRequest: resp2._id };
    //         const neighborResp: AddNeighborResponse = await client.sendAddNeighborRequest(neighborReq);
    //         expect(neighborResp.status).toEqual('requestSent');

    //         const neighborResp2: AddNeighborResponse = await client.sendAddNeighborRequest(neighborReq);
    //         expect(neighborResp2.status).toEqual('requestSent');
    //     });

    //     it('already received request', async () => {
    //         const req: AccountCreateRequest = { username: 'create14user', password: 'create14pass' };
    //         const resp: AccountCreateResponse = await client.createAccount(req);
    //         expect(resp).resolves.toBeDefined();

    //         const req2: AccountCreateRequest = { username: 'create15user', password: 'create15pass' };
    //         const resp2: AccountCreateResponse = await client.createAccount(req2);
    //         expect(resp2).resolves.toBeDefined();

    //         const neighborReq: AddNeighborRequest = { currentUserId: resp._id, UserIdToRequest: resp2._id };
    //         const neighborResp: AddNeighborResponse = await client.sendAddNeighborRequest(neighborReq);
    //         expect(neighborResp.status).toEqual('requestSent');

    //         const neighborReq2: AddNeighborRequest = { currentUserId: resp2._id, UserIdToRequest: resp._id };
    //         const neighborResp2: AddNeighborResponse = await client.sendAddNeighborRequest(neighborReq2);
    //         expect(neighborResp2.status).toEqual('requestReceived');
    //     });

    //     it('already neighbors', async () => {
    //         // TODO -- need more functionality
    //     });
    // });
  });