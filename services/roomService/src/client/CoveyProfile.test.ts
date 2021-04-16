import { createTestClient } from 'apollo-server-testing';
import { ApolloServer } from 'apollo-server-express';
// import { GraphQLResponse } from 'graphql';
import {
  GraphQLResponse,
} from 'apollo-server-types';

import { createUser, deleteUserMutation, searchUserByEmailQuery, searchUserByNameQuery, updateUserMutation} from './TestQueries';
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
  let testUser: { email: string; username: string; password?: string; };
  let createUserResponse: GraphQLResponse;
  let deleteUserResponse: GraphQLResponse;

  beforeEach(async () => {
    testUser = { username: 'testUser', email: 'testUser123@gmail.com', password: '1234' };
    createUserResponse = await mutate({ mutation: createUser, variables: { input: testUser } });
  });

  afterEach(async () => {
    const deleteUserInput = {
      email: testUser.email,
    };
    deleteUserResponse = await mutate({ mutation: deleteUserMutation, variables: { input: deleteUserInput } });
    expect(deleteUserResponse).toBeTruthy();
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

