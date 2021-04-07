import gql from 'graphql-tag';
import { TownCreateRequest } from '../classes/TownsServiceClient';
import client from './client';

/**
 * Envelope that wraps any response from the server
 */
export interface AddFriendRequest {
  userNameTo: string;
  userNameFrom: string;
}

/**
 * Envelope that wraps any response from the server
 */
export interface SearchUserRequest {
  username: string;
}

/**
 * Envelope that wraps any response from the server
 */
export interface User {
  id: string;
  username: string;
  email: string;
  bio: string;
  location: string;
  occupation: string;
  instagramLink: string;
  facebookLink: string;
  linkedInLink: string;
  requests: [];
  friends: [],
  sentRequests: [],
}


const findAllUsers = gql`
  query findAllUsers {
    users {
      username
      email
    }
  }
`;

const searchUserByUserNameQuery = gql`
  query searchUserByUserName ($username: userName) {
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

const searchUserByEmailQuery = gql`
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

const createTownMutation = gql`
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

const addFriendMutation = gql`
  mutation addFriend($input: addFriendInput!) {
    addFriend(input: $input) 
  }
`;

export const findAllUserProfiles = async (): Promise<any> => {
  const { data } = await client.query({ query: findAllUsers });
  return data.users;
};

/* export const searchUserByUserName = async (userName: string): Promise<any> => {
  const { data } = await client.query({
    query: searchUserByUserNameQuery,
    variables: { userName },
  });
  return data.searchUser;
} */

export const searchUserByEmail = async (email: string): Promise<any> => {
  const { data } = await client.query({
    query: searchUserByEmailQuery,
    variables: { email },
  });
  console.log(data);
  return data.searchUserByEmail;
}


export const createTown = async (payload: TownCreateRequest): Promise<any> => {
  const { data } = await client.mutate({
    mutation: createTownMutation,
    variables: { input: payload },
  });
  if (data.townCreateRequest.isOK) {
    return data.townCreateRequest.response;
  }
  return null;
};

export const addFriend = async (payload: AddFriendRequest): Promise<any> => {
  const { data } = await client.mutate({
    mutation: addFriendMutation,
    variables: {input: payload},
  });
  return data.addFriend;
}

