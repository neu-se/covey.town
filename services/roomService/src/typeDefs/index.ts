import { gql } from 'apollo-server-express';

/**
 * Represents the schema : All the queries , mutations are defined here.
 */
export const typeDefs = gql`
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

input townJoinRequestInput {
  userName: String!
  coveyTownID: String!
}

input townCreateRequestInput {
  friendlyName: String!
  isPubliclyListed: Boolean!
}

input townDeleteRequestInput {
  coveyTownID: String!
  coveyTownPassword: String!
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
  isOK: Boolean!
  response: Town
  message : String
}

type TownCreateResponse {
  coveyTownID: String
  coveyTownPassword: String
}

type TownCreateResponseEnevelope {
  isOK: Boolean!
  response: TownCreateResponse
  message : String
}

type TownDeleteResponse {
  response: String
}

type TownDeleteResponseEnvelope {
  isOK: Boolean!
  response: TownDeleteResponse
  message : String
}

type Mutation {
  signUp(input: signUpInput) : User
  townJoinRequest(input: townJoinRequestInput): TownJoinResponse
  townCreateRequest(input: townCreateRequestInput): TownCreateResponseEnevelope
  townDeleteRequest(input: townDeleteRequestInput): TownDeleteResponseEnvelope
}
`;