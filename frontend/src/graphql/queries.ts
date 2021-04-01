import gql from 'graphql-tag';
import client from './client';
import { TownJoinRequest } from '../classes/TownsServiceClient';

const findAllUsers = gql`
  query findAllUsers {
    users {
      userName
      email
    }
  }
`;

const findAllUserProfiles = async () => {
  const { data } = await client.query({ query: findAllUsers });
  return data.users;
};
export default findAllUserProfiles;

const joinTownMutation = gql`
  mutation joinTown($input: townJoinJoinRequestInput!)
  {
    isOK
    response {
      coveyUserID
      coveySessionToken
      providerVideoToken
      currentPlayers {
        _id
      }
    friendlyName
    isPubliclyListed 
  }
  message
}
`;


export const joinTown = async (payload: TownJoinRequest) : Promise<any> =>  {
const { data } = await client.mutate({
  mutation: joinTownMutation,
  variables: { input: payload }
});
  
  if (data.townJoinJoinRequest.isOK) {
    return data.townJoinJoinRequest.response;
  }
  return null;
  
}



