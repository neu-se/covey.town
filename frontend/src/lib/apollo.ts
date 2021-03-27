import {useMemo} from 'react';
import {ApolloClient, InMemoryCache, NormalizedCacheObject, 
    HttpLink, gql } from '@apollo/client';

const createApolloClient = () => new ApolloClient({
        link: new HttpLink({
            uri: 'https://covey-town-db.hasura.app/v1/graphql',
            headers: {'Content-type': 'application/json'}
        }),
        cache:  new InMemoryCache()
    })

const apolloClient: ApolloClient<NormalizedCacheObject> = createApolloClient();

apolloClient
  .query({
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

/** 

export default function initializeApollo(initialState = null): ApolloClient<NormalizedCacheObject> {

    // check if apollo client instance exists, if not, create
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const _apolloClient = apolloClient || createApolloClient();

    // check if there is initalState and if so, fetch cache
    if(initialState){
        const exisitingCache = _apolloClient.extract();
        // restore cache
        _apolloClient.cache.restore({exisitingCache, initialState})
    }

    // check if mode is ssr always create ApolloClient
    if (typeof window === 'undefined') return _apolloClient;

    // create client once on front end
    if (!apolloClient) apolloClient = _apolloClient;

    return _apolloClient;
}

export function useApollo(initialState: any): void{
    const store = useMemo(() => initializeApollo(initialState), [initialState])

}
*/
