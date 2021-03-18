//const { gql } = require('../graphQLServer.ts');
const { gql} = require('apollo-server-express');
module.exports = gql`
type Query {
  users: [User!]
  user(id: ID!): User
}

type User {
  id: ID!
  name: String
  email: String
}


input signUpInput {
name: String !
email: String
password : String!
}

input loginInput {
  email: String!
  pasword: String!
}


type Mutation {
  signUp(input: signUpInput) : User
}
`;