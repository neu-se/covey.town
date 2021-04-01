import gql from 'graphql-tag';
import client from './client';

const findAllUsers = gql`
  query findAllUsers {
    users {
      name
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
  mutation joinTown($TownJoinRequest: TownJoinRequest!)
  @rest(type: "Town", path: "/sessions", method: "POST") {
    isOK
    response
    message
  }
  `;

const TownJoinRequest = gql`
  type TownJoinRequest {
    userName: String!
    coveyTownID: String!
  }
`;

export async function joinTown(TownJoinRequest: any) {
const { data } = await client.mutate({
  mutation: joinTownMutation,
  variables: { input: TownJoinRequest }
});
}
