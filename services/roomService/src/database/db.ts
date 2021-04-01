import assert from 'assert';
import dotenv from 'dotenv';
import { MongoClient, ObjectID } from 'mongodb';
import { mongo } from 'mongoose';

dotenv.config();

export type NeighborStatus = { status: 'unknown' | 'requestSent' | 'requestReceived' | 'neighbor' };

export interface AccountCreateResponse {
  _id: string,
  username: string,
}

export interface UserWithRelationship {
  _id: string,
  username: string,
  relationship: NeighborStatus,
}

export interface UsersList {
  _id: string,
  username: string,
}

export interface ListUsersResponse<T> {
  users: T[]
}

export interface LoginResponse {
  _id: string,
  username: string,
}

export interface NeighborMappingSchema {
  _id: string,
  neighbor1: string, // will be user id
  neighbor2: string, // will be user id
}

export interface NeighborRequestSchema {
  _id: string, 
  requestTo: string, // will be user id
  requestFrom: string, // will be user id
}

export default class DatabaseController {
    private client: MongoClient;
    private userCollection: any;
    private neighborRequests: any;
    private neighborMappings: any;

    constructor() {
        // assert(process.env.MONGO_URL, 'Must have Mongo URL to connect to database');
        this.client = new MongoClient(process.env.MONGO_URL || 'mongodb+srv://dev-user:cs4530COVEY@cluster-dev.vpr5c.mongodb.net/coveytown?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
    }

  async connect(): Promise<void> {
    await this.client.connect();
    this.userCollection = this.client.db('coveytown').collection('user');
    this.neighborRequests = this.client.db('coveytown').collection('neighbor_request');
    this.neighborMappings = this.client.db('coveytown').collection('neighbor_mappings');
  }

    close() {
        this.client.close();
    }

    /**
     * Returns an object with access to a collection in the coveytown db.
     * @param collection name of the collection to open
     * @returns
     */
  private getCollection(collection: string) {
    return this.client.db('coveytown').collection(collection);
  }

  /**
     * Works to remove a user from the user collection in the coveytown db
     * @param userID name of the collection to remove user from
     * @returns a string with the deletion status
     */
  async removeUserFromCollection(userID: string): Promise<string> {
    try {
      const deleteUser = new mongo.ObjectId(userID);
      await this.userCollection.deleteOne({'_id': deleteUser});
      return 'deletedUser';
    } catch (err) {
      return err.toString();
    }
  }

  /**
     * Works to remove a request from the neighbor_request collection in the coveytown db
     * @param requestFrom name of the user sending the request to be removed
     * @param requestTo name of the user receiving the request to be removed
     * @returns a string with the deletion status
     */
  async removeRequestFromCollection(requestFrom: string, requestTo: string): Promise<string> {
    try {
      await this.neighborRequests.deleteOne({'requestFrom': requestFrom, 'requestTo': requestTo});
      return 'deletedRequest';
    } catch (err) {
      return err.toString();
    }
  }

  /**
     * Works to remove a mapping from the neighbor_mappings collection in the coveytown db
     * @param neighbor1 name of the user whose friend request was accepted
     * @param neighbor2 name of the user who accepted the friend request
     * @returns a string with the deletion status
     */
   async removeMappingFromCollection(neighbor1: string, neighbor2: string): Promise<string> {
    try {
      await this.neighborMappings.deleteOne({'neighbor1': neighbor1, 'neighbor2': neighbor2});
      return 'deletedRequest';
    } catch (err) {
      return err.toString();
    }
  }

  /**
     * Creates an account using the passed username and password.
     * @param username the username of the new user
     * @param password the password of the new user
     * @returns a ResponseEnvelope with an AccountCreateResponse
     */
  async insertUser(username: string, password: string) : Promise<AccountCreateResponse> {
    try {
      const accountCreateResponse = await this.userCollection.insertOne({'username':username, 'password':password});

      return  {
        _id: String(accountCreateResponse.ops[0]._id),
        username: String(accountCreateResponse.ops[0].username),
      };
    } catch (err) {
      return err.toString();
    }

  }

  /**
     * Attempt to log in with this username and password
     * @param username the username of the returning user
     * @param password the password of the returning user
     * @returns a ResponseEnvelope with a LoginResponse
     */
  async login(username: string, password: string) : Promise<LoginResponse | string> {
    try {

      const findUser = await this.userCollection.find({'username': username, 'password': password}).limit(1).toArray();

      if (findUser.length === 0) {
        return 'Invalid Username and Password';
      } 

      return  {
        _id: String(findUser[0]._id),
        username: String(findUser[0].username),
      };
    } catch (err) {
      return err.toString();
    }
}

    async searchUsersByUsername(currentUserId: string, username: string) : Promise<ListUsersResponse<UserWithRelationship>> {

      //need to also take in username of player searching to get neighborStatus
      try {
          const userId = await this.findUserIdByUsername(username) as string;
          const status = await this.neighborStatus(currentUserId, userId);
          if (userId !== 'user_not_found') {
              return {
                  users: [{
                      _id: userId,
                      username,
                      relationship: status,
                  }]
              }
          }

          // else do partial match search

          const searchPartialMatch = await this.userCollection.find({'username': {'$regex': `^${username}`, '$options': 'i'}}).project({'username': 1}).toArray();

          const matchesWithStatus = await Promise.all<UserWithRelationship>(searchPartialMatch.map(async (match: any) => {
            assert(match._id);
            assert(match.username);
            const status: NeighborStatus = await this.neighborStatus(currentUserId, match._id.toString());
            assert(status.status);
            return {_id: match._id, username: match.username, relationship: status};
          }));

          // // get neighbor status for each user returned
          // //return {id, username, neighborStatus}
          // // do same thing for listing requests sent and requests received

          return {
            users: matchesWithStatus,
          }
      } catch (err) {
          return err.toString();
      }
  }
  

  /**
     * Find a user's ID given their username
     * @param username: the string username of the user to search for
     * @returns a string containing the user's ID
     */
  async findUserIdByUsername(username: string) : Promise<string> {
    try {

      const findUser = await this.userCollection.find({ 'username': username }).limit(1).toArray();
      if (findUser.length === 1) {

        return findUser[0]._id.toString();
      }
      return 'user_not_found';

    } catch (err) {
      return err.toString();
    }
  }

  /**
   * Find a user's ID given their username
   * @param id: the string id of the user to search for
   * @returns a string containing the username
   */
  async findUserById(id: string) : Promise<string> {
    try {

      const findUser = await this.userCollection.find({ '_id': new ObjectID(id) }).limit(1).toArray();
      if (findUser.length === 1) {
        return findUser[0].username as string;
      }
      return 'user_not_found';

    } catch (err) {
      return err.toString();
    }
  }
  

  async validateUser(userID: string) : Promise<string> { 
    try {
      const findUser = await this.userCollection.find({ '_id': new ObjectID(userID)}).limit(1).toArray();
      if (findUser.length === 1) {
        return 'existing user';
      }
      return 'user_not_found';

    } catch (err) {
      return err.toString();
    }
  }

  /**
     * Sending a neighbor request. Attempts to send a neighbor_request from requestFrom to requestTo
     * @param requestFrom the string _id of the user sending the request
     * @param requestTo the string _id of the player receiving a request
     * @returns a ResponseEnvelope with a NeighborStatus
     */
  async sendRequest(requestFrom: string, requestTo: string) : Promise<NeighborStatus> {
    try {
      // Determine if this request has already been sent
      const neighborStatus = await this.neighborStatus(requestFrom, requestTo);

      if (neighborStatus.status === 'neighbor' || neighborStatus.status === 'requestReceived' || neighborStatus.status === 'requestSent') {
        return neighborStatus;
      }

      await this.neighborRequests.insertOne({'requestFrom': requestFrom, 'requestTo': requestTo});

      return { status: 'requestSent' };

    } catch (err) {
      return err.toString();
    }
  }

  /**
     *  Function to determine the status of the relationship between the current user and the user being viewed
     *
     * @param user the string_id of current user
     * @param otherUser the string_id of other user
     * @returns a NeighborStatus
     */
  async neighborStatus(user: string, otherUser: string): Promise<NeighborStatus> {
    try {
      const checkIfNeighbors = await this.checkIfNeighbors(user, otherUser);
      if (checkIfNeighbors) {
        return { status: 'neighbor' };
      }

      const requestSent = await this.neighborRequests.find({requestFrom: user, requestTo: otherUser}).toArray();
      if (requestSent.length === 1) {
        return { status: 'requestSent'};
      }

      const requestReceived = await this.neighborRequests.find({requestFrom: otherUser, requestTo: user}).limit(1).toArray();
      if (requestReceived.length === 1) {
        return { status: 'requestReceived' };
      }

      return { status: 'unknown' };

    } catch (err) {
      return err.toString();
    }
  }


  /**
   * List all users that have sent a request to the current user
   * @param currentUserId the string_id of the current user
   * @returns a ResponseEnvelope with an Array listing user string_id's and NeighborStatus
   */
  async listRequestsReceived(currentUserId: string): Promise<ListUsersResponse<UsersList>> {
    try {
        const requestReceived = await this.neighborRequests.find({'requestTo': currentUserId}).toArray();

        const listUsers = await Promise.all<UsersList>(requestReceived.map(async (requester: NeighborRequestSchema) => {
          const username = await this.findUserById(requester.requestFrom);
          return { _id: requester.requestFrom, username };
        }));

        return {
          users: listUsers
        }

    } catch (err) {
        return err.toString();
    }
  } 

  /**
   * List all users who have been sent a request by the current user
   * @param currentUserId the string_id of the current user
   * @returns a ResponseEnvelope with an Array listing user string_id's and NeighborStatus
   */
  async listRequestsSent(currentUserId: string): Promise<ListUsersResponse<UsersList>> {
      try {
        const requestSent = await this.neighborRequests.find({'requestFrom': currentUserId}).toArray();

        const listUsers = await Promise.all<UsersList>(requestSent.map(async (requestee: NeighborRequestSchema) => {
          const username = await this.findUserById(requestee.requestTo);
          return { _id: requestee.requestTo, username };
        }));

        return {
          users: listUsers
        }

      } catch (err) {
        return err.toString();
      }
  }

  /**
   * List all the neighbors of the current user
   * @param user the string_id of the current user
   * @returns a ResponseEnvelope with an Array listing user string_id's and NeighborStatus
   */
  async listNeighbors(currentUserId: string): Promise<ListUsersResponse<UsersList>> {
      try {
          const neighborsList1 = await this.neighborMappings.find({'neighbor1': currentUserId}).toArray();

          const listUsers1 = await Promise.all<UsersList>(neighborsList1.map(async (neighbor: NeighborMappingSchema) => {
            const username = await this.findUserById(neighbor.neighbor2);
            return { _id: neighbor.neighbor2, username };
          }));


          const neighborsList2 = await this.neighborMappings.find({'neighbor2': currentUserId}).toArray();

          const listUsers2 = await Promise.all<UsersList>(neighborsList2.map(async (neighbor: NeighborMappingSchema) => {
            const username = await this.findUserById(neighbor.neighbor1);
            return { _id: neighbor.neighbor1, username };
          }));

          return {
            users: listUsers1.concat(listUsers2),
          }

      } catch (err) {
          return err.toString();
      }
  }

  /**
     * Check if the two users passed are currently neighbors
     * @param user1 the string_id of one user
     * @param user2 the string_id of the other user
     * @returns true if neighbors, false if not
     */
  async checkIfNeighbors(user1: string, user2: string): Promise<boolean | undefined> {
    try {
      // const neighborMappings = this.getCollection('neighbor_mappings');

      const neighbors1 = await this.neighborMappings.find({'neighbor1': user1, 'neighbor2': user2}).limit(1).toArray();

      if (neighbors1.length === 1) {
        return true;
      }

      const neighbors2 = await this.neighborMappings.find({'neighbor1': user2, 'neighbor2': user1}).limit(1).toArray();

      if (neighbors2.length === 1) {
        return true;
      }

      return false;

    } catch (err) {
      return err;
    }
  }

  /**
     * Accepts the request for the user who received one
     * @param userAccepting the string_id of the user who received the request and is accepting it
     * @param userSent the string_id of the user who sent the request
     * @returns a response evnelope with the NeighborStatus of the two users
     */
  async acceptRequest(userAccepting: string, userSent: string): Promise<NeighborStatus> {
    try {
      const neighborStatus = await this.neighborStatus(userAccepting, userSent);

      if (neighborStatus.status !== 'requestReceived') {
        return neighborStatus;
      }

      await this.neighborRequests.deleteOne({'requestFrom': userSent, 'requestTo': userAccepting});

      await this.neighborMappings.insertOne({'neighbor1': userSent, 'neighbor2': userAccepting});

      return {
        status: 'neighbor',
      };

    } catch (err) {
      return err.toString();
    }
  }

  /**
     * Removes the neighbor request sent from user to requestedUser
     * @param user the string_id of the current user
     * @param requestedUser the string_id of the requestedUser
     * @returns a ResponseEnvelope with a Neighbor Status
     */
  async removeNeighborRequest(user: string, requestedUser: string): Promise<NeighborStatus> {
    try {

      const findRequest = await this.neighborStatus(user, requestedUser);

      if (findRequest.status !== 'requestSent') {
        return findRequest;
      }

      await this.neighborRequests.deleteOne({'requestFrom': user, 'requestTo': requestedUser});

      return { status: 'unknown' };

    } catch (err) {
      return err.toString();
    }
  }

  /**
     * Removes the neighbor relationship between the user and neighbor
     * @param user the string_id of the current user
     * @param neighbor the string_id of the neighbor to remove
     * @returns a ResponseEnvelope with a NeighborStatus
     */
  async removeNeighbor(user: string, neighbor: string): Promise<NeighborStatus> {
    try {
      const neighborStatus = await this.neighborStatus(user, neighbor);

      if (neighborStatus.status !== 'neighbor') {
        return neighborStatus;
      }

      const neighbor1 = await this.neighborMappings.find({'neighbor1': user, 'neighbor2': neighbor}).limit(1).toArray();

      if (neighbor1.length === 1) {
        await this.neighborMappings.deleteOne({'neighbor1': user, 'neighbor2': neighbor});
        return { status: 'unknown' };
      }

      await this.neighborMappings.deleteOne({'neighbor1': neighbor, 'neighbor2': user});
      return { status: 'unknown' };
            

    } catch (err) {
      return err.toString();
    }
  }
}