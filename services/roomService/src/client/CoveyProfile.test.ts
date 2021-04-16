import { createTestClient } from 'apollo-server-testing';
import { ApolloServer } from 'apollo-server-express';
<<<<<<< HEAD
import {
  GraphQLResponse,
} from 'apollo-server-types';
import {
  createUser,
  addFriendMutation,
  deleteUserMutation,
  acceptFriendMutation,
  rejectFriendMutation,
  searchUserByUserNameQuery,
  findAllUsers,
  searchUserByEmailQuery,
  searchUserByNameQuery,
  updateUserMutation,
} from './TestQueries';
=======
import { createUser } from './TestQueries';
>>>>>>> 1abb535c203e1b9c8253793675a60e8c21cfd021
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


beforeAll(async () => {
  await connection();
});

describe('Testing queries', () => {
<<<<<<< HEAD
  let testUser: { email: string; username: string; password?: string; };
  let createUserResponse: GraphQLResponse;

  beforeEach(async () => {
    testUser = { username: 'testUser', email: 'testUser123@gmail.com', password: '1234' };
    createUserResponse = await mutate({ mutation: createUser, variables: { input: testUser } });
  });

  afterEach(async () => {
    const deleteUserInput = {
      email: testUser.email,
    };
    await mutate({ mutation: deleteUserMutation, variables: { input: deleteUserInput } });
  });

  it('search user profile by email', async () => {
    const searchUserByEmailResponse = await query({ query: searchUserByEmailQuery, variables: { email: testUser.email } });
    expect(searchUserByEmailResponse.data.searchUserByEmail.email).toBe(testUser.email);
    expect(searchUserByEmailResponse.data.searchUserByEmail.username).toBe(testUser.username);
    expect(searchUserByEmailResponse.errors).toBeUndefined();
  });

  it('search user profile by name', async () => {
    const searchUserByNameResponse = await query({ query: searchUserByNameQuery, variables: { username: testUser.username } });
    expect(searchUserByNameResponse.data.searchUserByName.email).toBe(testUser.email);
    expect(searchUserByNameResponse.data.searchUserByName.username).toBe(testUser.username);
    expect(searchUserByNameResponse.errors).toBeUndefined();
  });

  it('create user', async () => {
    const newUser = { username: 'newUser', email: 'newcoveyuser@gmail.com', password: '12345' };
    const createNewUserResponse = await mutate({ mutation: createUser, variables: { input: newUser } });
    expect(createNewUserResponse.data.signUp.email).toBe('newcoveyuser@gmail.com');
    const deleteUserInput = {
      email: newUser.email,
    };
    const deleteNewUserResponse = await mutate({ mutation: deleteUserMutation, variables: { input: deleteUserInput } });
    expect(deleteNewUserResponse).toBeTruthy();
  });

  it('delete user', async () => {
    const newUser = { username: 'newUser', email: 'newcoveyuser@gmail.com', password: '12345' };
    const createNewUserResponse = await mutate({ mutation: createUser, variables: { input: newUser } });
    expect(createNewUserResponse.data.signUp.email).toBe('newcoveyuser@gmail.com');
    const deleteUserInput = {
      email: newUser.email,
    };
    const deleteNewUserResponse = await mutate({ mutation: deleteUserMutation, variables: { input: deleteUserInput } });
    expect(deleteNewUserResponse).toBeTruthy();
  });

  it('update only one field for user', async () => {
    const updateUserInput = {
      id: createUserResponse.data?.signUp.id,
      email: testUser.email,
      userName: testUser.username,
      password: testUser.password,
      bio: 'MSCS student at Northeastern University',
    };
    const updateUserResponse = await mutate({ mutation: updateUserMutation, variables: { input: updateUserInput } });
    expect(updateUserResponse.data.updateUser.bio).toBe('MSCS student at Northeastern University');
    expect(createUserResponse.data?.signUp.email).toBe('testUser123@gmail.com');
    
  });

  it('update all fields for user', async () => {
    const updateUserInput = {
      id: createUserResponse.data?.signUp.id,
      email: testUser.email,
      userName: testUser.username,
      password: testUser.password,
      bio: 'MSCS student at Northeastern University',
      location: 'Boston',
      occupation: 'SDE',
      instagramLink: 'https://www.instagram.com/test.user/',
      facebookLink: 'https://www.facebook.com/test.user/',
      linkedInLink: 'https://www.linkedin.com/test.user/',
    };
    const updateUserResponse = await mutate({ mutation: updateUserMutation, variables: { input: updateUserInput } });
    expect(updateUserResponse.data.updateUser.bio).toBe('MSCS student at Northeastern University');
    expect(updateUserResponse.data.updateUser.location).toBe('Boston');
    expect(updateUserResponse.data.updateUser.occupation).toBe('SDE');
    expect(updateUserResponse.data.updateUser.instagramLink).toBe('https://www.instagram.com/test.user/');
    expect(updateUserResponse.data.updateUser.facebookLink).toBe('https://www.facebook.com/test.user/');
    expect(updateUserResponse.data.updateUser.linkedInLink).toBe('https://www.linkedin.com/test.user/');
  });

});

describe('Testing queries', () => {
  let testUserOne : { email: string; username: string; password?: string; };
  let testUserTwo : { email: string; username: string; password?: string; };
  beforeEach(async () => {
    testUserOne = { username: 'vaidehi123', email: 'vaidehi1236@gmail.com', password: '123478' };
    testUserTwo = { username: 'vaibhavi234', email: 'vaibhavi123@gmail.com', password: '1234' };
    await mutate({ mutation: createUser, variables: { input: testUserOne }});
    await mutate({ mutation: createUser, variables: { input: testUserTwo }});
  });

  afterEach(async () => {
    const testInput = { email: testUserOne.email };
    const testInputTwo = { email: testUserTwo.email };
    await mutate({ mutation: deleteUserMutation, variables: { input: testInput }});
    await mutate({ mutation: deleteUserMutation, variables: { input: testInputTwo }});
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

  it('substring search', async () => {
    const inputTest = { username: 'vai' };
    const queryResponse = await query({ query: searchUserByUserNameQuery, variables: inputTest});
    expect(queryResponse.data.searchUserByUserName.length).not.toBe(0);
  });

  it('list all users', async () => {
    const queryResponse = await query({ query: findAllUsers});
    expect(queryResponse.data.users.length).not.toBe(0);
  });

  it('friend list update test', async () => {
    const inputTest = { userNameTo: testUserOne.username, userNameFrom: testUserTwo.username };
    const addFriendResponse = await mutate({ mutation: addFriendMutation, variables: { input: inputTest }});
    expect(addFriendResponse.data.addFriend).toBe(true);
    const acceptFriendResponse = await mutate({ mutation: acceptFriendMutation, variables: { input: inputTest }});
    expect(acceptFriendResponse.data.acceptFriend).toBe(true);
    const searchUserByEmailResponse = await query({ query: searchUserByEmailQuery, variables: { email: testUserOne.email } });
    expect(searchUserByEmailResponse.data.searchUserByEmail.friends.length).not.toBe(0);
    const searchUserByEmailResponseTwo = await query({ query: searchUserByEmailQuery, variables: { email: testUserTwo.email } });
    expect(searchUserByEmailResponseTwo.data.searchUserByEmail.friends.length).not.toBe(0);
  });

=======
  it('create user', async () => {
    const testUser = { username: 'anu', email: 'ananya@gmail.com', password: '1234' };
    const createUserResponse = await mutate({ mutation: createUser, variables: { input: testUser }});
    expect(createUserResponse.data.signUp.username).toBe('anu');
  });
>>>>>>> 1abb535c203e1b9c8253793675a60e8c21cfd021
});

