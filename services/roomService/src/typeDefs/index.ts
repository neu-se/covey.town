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

input TownJoinRequestInput {
  userName: String!
  coveyTownID: String!
  Direction: String
}

type UserLocation {
  x: Int!
  y: Int!
  rotation: String!
  moving : Boolean!
}

type Player {
  _id: String!
  _userName: String!
  location: UserLocation!
}

type Town {
  coveyUserID: String!
  coveySessionToken: String!
  providerVideoToken: String!
  currentPlayers: [Player!]
  friendlyName: String!
  isPubliclyListed: Boolean!
}

type TownJoinResponse {
  isOk: Boolean!
  response: Town
  message : String
}

type Mutation {
  signUp(input: signUpInput) : User
  townJoinRequest(input: townJoinRequestInput): TownJoinResponse
`;