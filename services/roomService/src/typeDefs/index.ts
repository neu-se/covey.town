import { gql } from 'apollo-server-express';

/**
 * Represents the schema : All the queries , mutations are defined here.
 */
const typeDefs = gql`
type Query {
  users: [User!]
  searchUserById(id: ID!): User!
  searchUserByUserName(username: String!): [User!]
  searchUserByEmail(email: String!) : User!
  searchUserByName(username: String!) : User!
  townList: TownListResponseEnvelope!
}

type User {
  id: ID!
  username: String
  email: String
  bio: String
  location: String
  occupation: String
  instagramLink: String
  facebookLink: String
  linkedInLink: String
  requests:[String!]
  friends:[String!]
  sentRequests:[String!]
}


input signUpInput {
  userName: String !
  email: String
  password : String!
}

input loginInput {
  email: String!
  password: String!
}

input townJoinRequestInput {
  userName: String!
  coveyTownID: String!
}

input townCreateRequestInput {
  friendlyName: String!
  isPubliclyListed: Boolean!
}

input updateUserInput {
  id: ID!
  userName: String
  email: String
  bio: String
  location: String
  occupation: String
  instagramLink: String
  facebookLink: String
  linkedInLink: String
  password: String
}

input deleteUserInput {
  email: String
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

type CoveyTownList {
  friendlyName: String!
  coveyTownID: String!
  currentOccupancy: Int!
  maximumOccupancy: Int!
}

type TownListResponseEnvelope {
  isOK: Boolean!
  response: Towns
}

type Towns {
  towns : [CoveyTownList!]
}

type Town {
  coveyUserID: String!
  coveySessionToken: String!
  providerVideoToken: String!
  currentPlayers: [Player!]
  friendlyName: String!
  isPubliclyListed: Boolean!
}

type searchUserResponse {
  users: [User!]
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

input addFriendInput {
  userNameTo: String
  userNameFrom: String
}

input townDeleteRequestInput {
  coveyTownID: String!
  coveyTownPassword: String!
}

type TownDeleteResponseEnvelope {
  isOK: Boolean!
  message : String
}

type Mutation {
  addFriend(input: addFriendInput): Boolean
  signUp(input: signUpInput) : User
  townJoinRequest(input: townJoinRequestInput): TownJoinResponse
  townCreateRequest(input: townCreateRequestInput): TownCreateResponseEnevelope
  townDeleteRequest(input: townDeleteRequestInput): TownDeleteResponseEnvelope
  updateUser(input: updateUserInput): User
  deleteUser(input: deleteUserInput): Boolean
  acceptFriend(input: addFriendInput): Boolean
  rejectFriend(input: addFriendInput): Boolean
}
`;

export default typeDefs;
