import TownsServiceClient, 
{AccountCreateRequest, AccountCreateResponse, 
LoginRequest, LoginResponse,
SearchUsersRequest, SearchUsersResponse,
AddNeighborRequest, AddNeighborResponse} from './TownsServiceClient';


const client = new TownsServiceClient('http://localhost:8081');

/*
NEED HELP WITH:
- figuring out how to clean database for tests (setup and teardown)
- seeing if we need axios tests using mocks?
- connecting to cors to make these tests work
*/
/*
first move this to testdb.ts and extract so we are testing the raw methods of database
second, one level out test the backend handler for the response envelopes (covey town request handlers)
focus on these unit tests for now
can add public methods to delete different type of collections - look into cascade delete
don't need to bring up the server

wait for sam to clean up his stuff, merge to backend, and then pull here

making sure im in hari-dev:
git pull origin backend

to make a file known as a test file: ...name...test.ts
*/

describe('TownsServiceClient', () => {
    
    describe('createAccount()', () => {
        it('creates successfully', async () => {
            const req: AccountCreateRequest = { username: 'create1', password: 'create1pass' };
            const resp: AccountCreateResponse = await client.createAccount(req);
            expect(resp).resolves.toBeDefined();
            expect(resp.username).toEqual('create1');
            expect(resp._id).toBeDefined();
        });

        it('fails to create successfully', async () => {
            const req1: AccountCreateRequest = { username: 'create2', password: '' }; // should fail on 'invalid password'
            const req2: AccountCreateRequest = { username: 'create3', password: 'create3pass' }; // should successfully get in
            const req3: AccountCreateRequest = { username: 'create3', password: 'create3pass2' }; // should fail on 'username taken'
            const resp1: Promise<AccountCreateResponse> = client.createAccount(req1);
            expect(resp1).rejects.toThrow('Error processing request: invalid password');
            const resp2: AccountCreateResponse = await client.createAccount(req2);
            expect(resp2).resolves.toBeDefined();
            const resp3: Promise<AccountCreateResponse> = client.createAccount(req3);
            expect(resp3).rejects.toThrow('Error processing requeset: Username taken');
        });
    });

    describe('loginToAccount()', () => {
        it('login successfully', async () => {
            const req: AccountCreateRequest = { username: 'create4', password: 'create4pass' };
            const resp: AccountCreateResponse = await client.createAccount(req);
            expect(resp).resolves.toBeDefined();

            const loginReq: LoginRequest = { username: 'create4', password: 'create4pass' };
            const loginResp: LoginResponse = await client.loginToAccount(loginReq);
            expect(loginResp).resolves.toBeDefined();
            expect(loginResp.username).toEqual('create4');
            expect(loginResp._id).toBeDefined();
        });

        it('fails to login successfully', async () => {
            const loginReq1: LoginRequest = { username: 'create5', password: 'create5pass' }; // should fail on 'No user with that username and password'
            const loginResp1: Promise<LoginResponse> = client.loginToAccount(loginReq1);
            expect(loginResp1).rejects.toThrow('Error processing request: No user with that username and password');

            const loginReq2: LoginRequest = { username: '', password: '' };
            const loginResp2: Promise<LoginResponse> = client.loginToAccount(loginReq2);
            expect(loginResp2).rejects.toThrow('Error processing request: No user with that username and password');

            const req: AccountCreateRequest = { username: 'create6', password: 'create6pass' };
            const resp: AccountCreateResponse = await client.createAccount(req);
            expect(resp).resolves.toBeDefined();

            const loginReq3: LoginRequest = { username: 'create6', password: 'wrongpassword' };
            const loginResp3: LoginResponse = await client.loginToAccount(loginReq3);
            expect(loginResp3).rejects.toThrow('Error processing request: No user with that username and password');

            const loginReq4: LoginRequest = { username: 'wrongusername', password: 'create6pass' };
            const loginResp4: LoginResponse = await client.loginToAccount(loginReq4);
            expect(loginResp4).rejects.toThrow('Error processing request: No user with that username and password');
        });
    });

    describe('searchForUsersByUsername()', () => {
        it('searched and found', async () => {
            const req: AccountCreateRequest = { username: 'create7', password: 'create7pass' };
            const resp: AccountCreateResponse = await client.createAccount(req);
            expect(resp).resolves.toBeDefined();

            const searchReq: SearchUsersRequest = { username: 'create7' };
            const searchResp: SearchUsersResponse = await client.searchForUsersByUsername(searchReq);
            expect(searchResp).resolves.toBeDefined();
            expect(searchResp.users).toContainEqual(expect.objectContaining({ _id: resp._id, username: 'create7' }));
        });

        it('searched and partial found', async () => {
            const req: AccountCreateRequest = { username: 'create8user', password: 'create8pass' };
            const resp: AccountCreateResponse = await client.createAccount(req);
            expect(resp).resolves.toBeDefined();

            const searchReq: SearchUsersRequest = { username: 'create8' };
            const searchResp: SearchUsersResponse = await client.searchForUsersByUsername(searchReq);
            expect(searchResp).resolves.toBeDefined();
            expect(searchResp.users).toContain(expect.objectContaining({ _id: resp._id, username: 'create8user' }));
        });

        it('searched and none found', async () => {
            const searchReq: SearchUsersRequest = { username: 'create9' };
            const searchResp: SearchUsersResponse = await client.searchForUsersByUsername(searchReq);
            expect(searchResp).resolves.toBeDefined();
            expect(searchResp.users).toEqual([]);
        });
    });

    describe('sendAddNeighborRequest()', () => {

        it('new request sent', async () => {
            const req: AccountCreateRequest = { username: 'create10user', password: 'create10pass' };
            const resp: AccountCreateResponse = await client.createAccount(req);
            expect(resp).resolves.toBeDefined();

            const req2: AccountCreateRequest = { username: 'create11user', password: 'create11pass' };
            const resp2: AccountCreateResponse = await client.createAccount(req2);
            expect(resp2).resolves.toBeDefined();

            const neighborReq: AddNeighborRequest = { currentUserId: resp._id, UserIdToRequest: resp2._id };
            const neighborResp: AddNeighborResponse = await client.sendAddNeighborRequest(neighborReq);
            expect(neighborResp.status).toEqual('requestSent');
        });

        it('already sent request', async () => {
            const req: AccountCreateRequest = { username: 'create12user', password: 'create12pass' };
            const resp: AccountCreateResponse = await client.createAccount(req);
            expect(resp).resolves.toBeDefined();

            const req2: AccountCreateRequest = { username: 'create13user', password: 'create13pass' };
            const resp2: AccountCreateResponse = await client.createAccount(req2);
            expect(resp2).resolves.toBeDefined();

            const neighborReq: AddNeighborRequest = { currentUserId: resp._id, UserIdToRequest: resp2._id };
            const neighborResp: AddNeighborResponse = await client.sendAddNeighborRequest(neighborReq);
            expect(neighborResp.status).toEqual('requestSent');

            const neighborResp2: AddNeighborResponse = await client.sendAddNeighborRequest(neighborReq);
            expect(neighborResp2.status).toEqual('requestSent');
        });

        it('already received request', async () => {
            const req: AccountCreateRequest = { username: 'create14user', password: 'create14pass' };
            const resp: AccountCreateResponse = await client.createAccount(req);
            expect(resp).resolves.toBeDefined();

            const req2: AccountCreateRequest = { username: 'create15user', password: 'create15pass' };
            const resp2: AccountCreateResponse = await client.createAccount(req2);
            expect(resp2).resolves.toBeDefined();

            const neighborReq: AddNeighborRequest = { currentUserId: resp._id, UserIdToRequest: resp2._id };
            const neighborResp: AddNeighborResponse = await client.sendAddNeighborRequest(neighborReq);
            expect(neighborResp.status).toEqual('requestSent');

            const neighborReq2: AddNeighborRequest = { currentUserId: resp2._id, UserIdToRequest: resp._id };
            const neighborResp2: AddNeighborResponse = await client.sendAddNeighborRequest(neighborReq2);
            expect(neighborResp2.status).toEqual('requestReceived');
        });

        it('already neighbors', async () => {
            // TODO -- need more functionality
        });
    });
  });