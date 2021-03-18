const { buildSchema } = require('graphql');

// Construct a schema, using GraphQL schema language
module.exports = buildSchema(`
  type User {
    username: String
    password: String
    email: String
  }

  type Query {
    users : [User]
    user(id: Int!): User 
  }
  
  type Mutation {
    createUser(username: String!,password: String!): User!
  }
`);
