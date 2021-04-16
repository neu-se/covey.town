import { buildSchema } from 'graphql';
import { graphqlHTTP } from 'express-graphql';
import  '../database/databaseService';

const schema = buildSchema(`
# userType
type User {
  email: String
  username: String
  nickname: String
  currentAvatar: String
}
# town type
type Town {
  coveyTownID: String!
  coveyTownPassword: String
  friendlyName: String
  isPublicallyListed: Boolean
}
type Query {
  savedTowns(email: String!): [Town]
  publicTowns: [Town]
  createdTowns(email: String!): [Town]
  user(email: String!): User
  town(townID: String!): Town
}`);



const rootResolver = {
  
};
const graphql = graphqlHTTP({schema, graphiql: true, rootValue: rootResolver });
module.exports = graphql;
