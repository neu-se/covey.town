import { createTestClient } from 'apollo-server-testing';
import { ApolloServer } from 'apollo-server-express';
import { createUser } from './TestQueries';
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
    const testUser = { username: 'anu', email: 'ananya@gmail.com', password: '1234' };
    const createUserResponse = await mutate({ mutation: createUser, variables: { input: testUser }});
    expect(createUserResponse.data.signUp.username).toBe('anu');
  });
});

