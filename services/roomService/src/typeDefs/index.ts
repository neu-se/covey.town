//const { gql } = require('../graphQLServer.ts');
const { gql} = require('apollo-server-express');
module.exports = gql`
type Query {
  users: [User!]
  user(id: ID!): User
}

type User {
  id: ID!
  username: String
  email: String
}


input signUpInput {
username: String !
email: String
password : String!
}

input loginInput {
  email: String!
  password: String!
}

input updateUsernameInput {
  id: ID!
  username: String
}

input updateEmailInput {
  id: ID!
  email: String
}

input updatePasswordInput {
  id: ID!
  password: String
}

input deleteUserInput {
  email: String!
}

type Mutation {
  signUp(input: signUpInput) : User
  login(input: loginInput) : User
  updateUsername(input: updateUsernameInput): Boolean
  updateEmail(input: updateEmailInput): Boolean
  updatePassword(input: updatePasswordInput): Boolean
  deleteUser(input: deleteUserInput): Boolean
}
`;