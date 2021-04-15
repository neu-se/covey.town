import { gql } from 'apollo-server-express';

export const createUser = gql`
  mutation signUp($input: signUpInput!) {
    signUp (input: $input){
      username
      email
    }
  }
`;
export const findAllUsers = gql`
  query findAllUsers {
    users {
      username
      email
    }
  }
`;

export const townList = gql`
  query townList {
    townList {
      isOK
      response {
        towns {
          friendlyName
          coveyTownID
          currentOccupancy
          maximumOccupancy
        }
      }
    }
  }
`;

export const findAllUsersByUserNameQuery = gql`
  query findAllUsersByUserName($username: String!) {
    searchUserByUserName(username: $username) {
      id
      username
      email
    }
  }
`;

export const searchUserByUserNameQuery = gql`
  query searchUserByUserName ($username: String!) {
    searchUserByUserName (username: $username){
      id
      username
      email
      bio
      location
      occupation
      instagramLink
      facebookLink
      linkedInLink
      requests
      friends
      sentRequests
    }
  }
`;

export const searchUserByEmailQuery = gql`
  query searchUserByEmail ($email: String!) {
    searchUserByEmail (email: $email){
      id
      username
      email
      bio
      location
      occupation
      instagramLink
      facebookLink
      linkedInLink
      requests
      friends
      sentRequests
    }
  }
`;

export const searchUserByNameQuery = gql`
  query searchUserByName ($username: String!) {
    searchUserByName (username: $username){
      id
      username
      email
      bio
      location
      occupation
      instagramLink
      facebookLink
      linkedInLink
      requests
      friends
      sentRequests
    }
  }
`;

export const createTownMutation = gql`
  mutation townCreate($input: townCreateRequestInput!) {
    townCreateRequest(input: $input) {
      isOK
      response {
        coveyTownID
        coveyTownPassword
      }
      message
    }
  }
`;

export const joinTownMutation = gql`
  mutation joinTown($input: townJoinRequestInput!){
    townJoinRequest(input: $input) {
      isOK
      response {
        coveyUserID
        coveySessionToken
        providerVideoToken
        currentPlayers {
          _id
          _userName
          location {
            x
            y
            rotation
            moving
          }
        }
        friendlyName
        isPubliclyListed
      }
      message
    }
  }
`;

export const deleteTownMutation = gql`
  mutation deleteTown($input: townDeleteRequestInput!) {
    townDeleteRequest(input: $input) {
      isOK
      message
    }
  }
`;

export const addFriendMutation = gql`
  mutation addFriend($input: addFriendInput!) {
    addFriend(input: $input)
  }
`;

export const updateUserMutation = gql`
  mutation updateUser($input: updateUserInput) {
    updateUser(input: $input){
        id,
        username,
        email,
        bio,
        location,
        occupation,
        instagramLink,
        facebookLink,
        linkedInLink,
    }
  }
`;

export const deleteUserMutation = gql`
  mutation deleteUser($input: deleteUserInput) {
    deleteUser(input: $input)
  }
`;

export const acceptFriendMutation = gql`
  mutation acceptFriend($input: addFriendInput!) {
    acceptFriend(input: $input)
  }
`;

export const rejectFriendMutation = gql`
  mutation rejectFriend($input: addFriendInput!) {
    rejectFriend(input: $input)
  }
`;
