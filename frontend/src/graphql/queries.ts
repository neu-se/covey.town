import gql from 'graphql-tag';
import { TownCreateRequest, TownDeleteRequest } from '../classes/TownsServiceClient';
import client from './client';

const findAllUsers = gql`
  query findAllUsers {
    users {
      userName
      email
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

const deleteTownMutation = gql`
  mutation townDelete($input: townDeleteRequestInput!) {
    townDeleteRequest(input: $input) {
      status
    }
  }
`;

export const findAllUserProfiles = async (): Promise<any> => {
  const { data } = await client.query({ query: findAllUsers });
  return data.users;
};

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


export const deleteTown = async (payload: TownDeleteRequest): Promise<any> => {
  await client.mutate({
    mutation: deleteTownMutation,
    variables: { input: payload },
  });
};
