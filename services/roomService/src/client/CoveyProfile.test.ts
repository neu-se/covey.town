import { createTestClient } from 'apollo-server-testing';
import { ApolloServer } from 'apollo-server-express';
import {
  createUser,
  addFriendMutation,
  deleteUserMutation,
  acceptFriendMutation,
  rejectFriendMutation,
} from './TestQueries';
import typeDefs from '../typeDefs';
import resolvers from '../resolvers';
import connection from '../data/Utils/index';

const context = { user: {email: 'admin@labtrail.app'} };

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => (context),
});

const { query, mutate } = createTestClient(server);

let testUserOne : any = {};
let testUserTwo : any = {};

beforeAll(async () => {
  await connection();
  testUserOne = { username: 'vaidehi123', email: 'vaidehi1236@gmail.com', password: '123478' };
  testUserTwo = { username: 'vaibhavi234', email: 'vaibhavi123@gmail.com', password: '1234' };
  await mutate({ mutation: createUser, variables: { input: testUserOne }});
  await mutate({ mutation: createUser, variables: { input: testUserTwo }});
});

afterAll(async () => {
  const testInput = { email: testUserOne.email };
  const testInputTwo = { email: testUserTwo.email };
  await mutate({ mutation: deleteUserMutation, variables: { input: testInput }});
  await mutate({ mutation: deleteUserMutation, variables: { input: testInputTwo }});
});

describe('Testing queries', () => {

  it('create user', async () => {
    const testUser = { username: 'anu1233', email: 'anany7890090@gmail.com', password: '1234' };
    const createUserResponse = await mutate({ mutation: createUser, variables: { input: testUser }});
    expect(createUserResponse.data.signUp.username).toBe('anu1233');
    const testInput = { email: testUser.email };
    await mutate({ mutation: deleteUserMutation, variables: { input: testInput }});
  });

  it('add friend', async () => {

    const inputTest = { userNameTo: testUserOne.username, userNameFrom: testUserTwo.username };
    const addFriendResponse = await mutate({ mutation: addFriendMutation, variables: { input: inputTest }});
    expect(addFriendResponse.data.addFriend).toBe(true);

  });

  it('accept friend', async () => {

    const inputTest = { userNameTo: testUserOne.username, userNameFrom: testUserTwo.username };
    await mutate({ mutation: addFriendMutation, variables: { input: inputTest }});
    const acceptFriendResponse = await mutate({ mutation: acceptFriendMutation, variables: { input: inputTest }});
    expect(acceptFriendResponse.data.acceptFriend).toBe(true);

  });

  it('reject friend', async () => {

    const inputTest = { userNameTo: testUserOne.username, userNameFrom: testUserTwo.username };
    await mutate({ mutation: addFriendMutation, variables: { input: inputTest }});
    const rejectFriendResponse = await mutate({ mutation: rejectFriendMutation, variables: { input: inputTest }});
    expect(rejectFriendResponse.data.rejectFriend).toBe(true);

  });

});

