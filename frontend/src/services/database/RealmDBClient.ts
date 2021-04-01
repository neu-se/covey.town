import { gql } from "@apollo/client";

import { CoveyUser, CoveyUserProfile } from '../../CoveyTypes';
import IDBClient from './IDBClient';

import RealmApp from './RealmApp';

/**
 * Singleton Database MongoDB Realm Client to perform CRUD operations 
 */
export default class RealmDBClient implements IDBClient {

  private static _instance: RealmDBClient;

  private _apolloClient;

  private constructor() {
    this._apolloClient = RealmApp.getInstance().ApolloClient;
  }

  /** Singleton instance */
  static getInstance(): RealmDBClient {
    if (RealmDBClient._instance === undefined) {
      RealmDBClient._instance = new RealmDBClient();
    }
    return RealmDBClient._instance;
  }

  /**
   * Lower level implementation of saving profile.
   * Update profile if exists, insert otherwise.
   * @param userProfile 
   */
  /** */
  async saveUserProfile(userID: string, userProfile: CoveyUserProfile): Promise<CoveyUserProfile> {
    const mutationQuery = gql
      `mutation {
      insertOneCoveyuser(data: {
        userID: "${userID}",
        profile: {
          username: "${userProfile.username}",
          email: "${userProfile.email}",
          bio: "${userProfile.bio}",
          pfpURL: "${userProfile.pfpURL}"
        }
      }) {
        profile {
          username,
          email,
          bio,
          pfpURL
        },
      }
    }`;
    const mutationResult = await this._apolloClient.mutate({ mutation: mutationQuery });
    const userProfileResult: CoveyUserProfile = mutationResult.data.insertOneCovey_user;
    return userProfileResult;
  }

  async getUser(userID: string): Promise<CoveyUser | null> {
    const gqlQuery = gql`query {
        coveyuser(query: {userID: "${userID}"}) {
          userID,
          isLoggedIn,
          profile {
            username,
            email,
            bio,
            pfpURL
          },
          friendIDs,
          currentTown {
            coveyTownID,
            friendlyName
          }
        }
      }`;
    const queryResult = await this._apolloClient.query({ query: gqlQuery });
    const coveyUser: CoveyUser | null = queryResult.data.coveyuser;
    return coveyUser;
  }

  async saveUser(coveyUser: CoveyUser): Promise<CoveyUser> {
    const mutationQuery = gql
      `mutation {
      upsertOneCoveyuser(query : {
        userID: "${coveyUser.userID}"
      }, data: {
        userID: "${coveyUser.userID}",
        profile: {
          username: "${coveyUser.profile.username}",
          email: "${coveyUser.profile.email}",
          bio: "${coveyUser.profile.bio ? coveyUser.profile.bio : ''}",
          pfpURL: "${coveyUser.profile.pfpURL ? coveyUser.profile.pfpURL : ''}"
        },
        friendIDs: ${JSON.stringify(coveyUser.friendIDs)},
        ${coveyUser.currentTown ? `currentTown: {coveyTownID: "${coveyUser.currentTown.coveyTownID}",friendlyName: "${coveyUser.currentTown.friendlyName}"},` : ''}
        isLoggedIn: ${coveyUser.isLoggedIn}
      }) {
      userID,
        profile {
          username,
          email,
          bio,
          pfpURL
        },
      currentTown {
        coveyTownID,
        friendlyName
      },
      isLoggedIn
      }
    }`;
    const mutationResult = await this._apolloClient.mutate({ mutation: mutationQuery });
    const coveyUserResult: CoveyUser = mutationResult.data.insertOneCoveyuser;
    return coveyUserResult;
  }
}