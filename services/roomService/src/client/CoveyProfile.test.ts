import { createTestClient } from 'apollo-server-testing';
import { ApolloServer } from 'apollo-server-express';
import { createUser, deleteUserMutation, updateUserMutation} from './TestQueries';
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
  it('create user', async () => {
    const testUser = { username: 'anu', email: 'ananya1234@gmail.com', password: '1234' };
    const createUserResponse = await mutate({ mutation: createUser, variables: { input: testUser } });
    expect(createUserResponse.data.signUp.email).toBe('ananya1234@gmail.com');
    const deleteUserInput = {
      email: testUser.email,
    };
    const deleteUserResponse = await mutate({ mutation: deleteUserMutation, variables: { input: deleteUserInput } });
    expect(deleteUserResponse).toBeTruthy();
  });

  it('delete user', async () => {
    const testUser = { username: 'testUser', email: 'testUser123@gmail.com', password: '1234' };
    const createUserResponse = await mutate({ mutation: createUser, variables: { input: testUser } });
    expect(createUserResponse.data.signUp.email).toBe('testUser123@gmail.com');
    const deleteUserInput = {
      email: testUser.email,
    };
    const deleteUserResponse = await mutate({ mutation: deleteUserMutation, variables: { input: deleteUserInput } });
    expect(deleteUserResponse).toBeTruthy();
  });
  it('update only one field for user', async () => {
    const testUser = { username: 'testUser', email: 'testUser123@gmail.com', password: '1234' };
    const createUserResponse = await mutate({ mutation: createUser, variables: { input: testUser } });
    const updateUserInput = {
      id: createUserResponse.data.signUp.id,
      email: testUser.email,
      userName: testUser.username,
      password: testUser.password,
      bio: 'MSCS student at Northeastern University',
    };
    
    const updateUserResponse = await mutate({ mutation: updateUserMutation, variables: { input: updateUserInput } });
    expect(updateUserResponse.data.updateUser.bio).toBe('MSCS student at Northeastern University');

    expect(createUserResponse.data.signUp.email).toBe('testUser123@gmail.com');
    const deleteUserInput = {
      email: testUser.email,
    };
    const deleteUserResponse = await mutate({ mutation: deleteUserMutation, variables: { input: deleteUserInput } });
    expect(deleteUserResponse).toBeTruthy();
  });
  it('update all fields for user', async () => {
    const testUser = { username: 'testUser', email: 'testUser123@gmail.com', password: '1234' };
    const createUserResponse = await mutate({ mutation: createUser, variables: { input: testUser } });
    expect(createUserResponse.data.signUp.email).toBe('testUser123@gmail.com');
    const updateUserInput = {
      id: createUserResponse.data.signUp.id,
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

    const deleteUserInput = {
      email: testUser.email,
    };
    const deleteUserResponse = await mutate({ mutation: deleteUserMutation, variables: { input: deleteUserInput } });
    // console.log(deleteUserResponse);
    expect(deleteUserResponse).toBeTruthy();
  });


});

