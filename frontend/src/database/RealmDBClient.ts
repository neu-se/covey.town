import { gql } from "@apollo/client";

import { CoveyUserProfile } from '../CoveyTypes';
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
  async saveUserProfile(userProfile: CoveyUserProfile): Promise<CoveyUserProfile> {
    const mutationQuery = gql 
    `mutation {
      upsertOneUser_profile(data: {
        bio: "${userProfile.bio ? userProfile.bio : ''}"
        email: "${userProfile.email}"
        pfpURL: "${userProfile.pfpURL ? userProfile.pfpURL : ''}"
        user_id: "${userProfile.id}"
        user_name: "${userProfile.userName ? userProfile.userName : ''}"
      }) {
          bio
          email
          pfpURL
          user_id
          user_name
      }
    }`;
    const mutationResult = await this._apolloClient.mutate({ mutation: mutationQuery });
    const userProfileResult: CoveyUserProfile = mutationResult.data.insertOneUser_profile;
    return userProfileResult;
  }

  /**
   * Search user profile using a user's id
   * @param userId 
   */
  async searchUserProfileById(userId: string): Promise<CoveyUserProfile | null> {
    const gqlQuery = gql
    `query {
      user_profile(query: {
        user_id: "${userId}"
      }) {
        user_id
        bio,
        email,
        pfpURL,
        user_name
      }
    }    
    `;
    const queryResult = await this._apolloClient.query({query: gqlQuery});
    const userProfileResult: CoveyUserProfile | null = queryResult.data.user_profile;
    return userProfileResult;
  } 
}