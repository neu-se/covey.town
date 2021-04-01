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
