import {ApolloClient, InMemoryCache, NormalizedCacheObject, HttpLink, gql } from '@apollo/client';

export default class CoveyApolloClient {

private client?: ApolloClient<NormalizedCacheObject>;

  constructor(){
    this.client = new ApolloClient<NormalizedCacheObject>({
        link: new HttpLink({
          uri: 'https://covey-town-db.hasura.app/v1/graphql',
          // remember to update and hide admin secret
          headers: {
            'x-hasura-admin-secret': 'nfAeMsAQniJefLE4p8C1DzOLaPwOZjHXueV2Q6G0a2M2zLYItLlDMf4Xv1H5Llxb'
          }
        }),
        cache: new InMemoryCache()
      });
    }
  
  // queries
  // queryUserFriends(userEmail) -> return their list of friends

  queryAllUsers(): any  {
    this.client?.query({
    query: gql`
      query fetchUsers {
      covey_town_Users {
        EmailAddress
        FirstName
        LastName
      }
    }
    `
    })
    .then(result => console.log(result));
  }
}