import gql from 'graphql-tag';
import { TownCreateRequest, TownJoinRequest } from '../classes/TownsServiceClient';
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

const joinTownMutation = gql`
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


export const joinTown = async (payload: TownJoinRequest) : Promise<any> =>  {
const { data } = await client.mutate({
  mutation: joinTownMutation,
  variables: { input: payload }
});
  
  if (data.townJoinRequest.isOK) {
    console.log("res:", data.townJoinRequest.response);
    return data.townJoinRequest.response;
  }
  return null;
  
}
