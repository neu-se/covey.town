import assert from 'assert';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { mongo } from 'mongoose';

dotenv.config();

export type NeighborStatus = { status: 'unknown' | 'requestSent' | 'requestReceived' | 'neighbor' };
export interface AccountCreateResponse {
  _id: string,
  username: string,
}
export interface SearchUsersResponse {
  users: {
    _id: string,
    username: string,
  }[]
}
export interface LoginResponse {
  _id: string,
  username: string,
}
export default class DatabaseController {
  private client;

  constructor() {
    // assert(process.env.MONGO_URL);
    this.client = new MongoClient('mongodb+srv://dev-user:cs4530COVEY@cluster-dev.vpr5c.mongodb.net/coveytown?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
    // new MongoClient(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  close(): void {
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

  async removeUserFromCollection(userID: string): Promise<string> {
    try {
      const users = this.getCollection('user');
      const deleteUser = new mongo.ObjectId(userID);
      await users.deleteOne({'_id': deleteUser});
      return 'deletedUser';
    } catch (err) {
      return err.toString();
    }
  }

  async removeRequestFromCollection(requestFrom: string, requestTo: string): Promise<string> {
    try {
      const neighborRequests = this.getCollection('neighbor_request');
      await neighborRequests.deleteOne({'requestFrom': requestFrom, 'requestTo': requestTo});
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
      const user = this.getCollection('user');
      const accountCreateResponse = await user.insertOne({'username':username, 'password':password});

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

      const allUsers = this.getCollection('user');
      const findUser = await allUsers.find({'username': username, 'password': password}).limit(1).toArray();

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

  async searchUsersByUsername(username: string) : Promise<SearchUsersResponse> {
    try {
      const user = await this.findUserId(username);

      if (user !== 'user_not_found') {
        return {
          users: [{
            _id: user,
            username,
          }],
        };
      }

      // else do partial match search
      const userCollection = this.getCollection('user');
      const searchPartialMatch = await userCollection.find({'username': {'$regex': `^${username}`, '$options': 'i'}}).project({'username': 1}).toArray();      return {
        users: searchPartialMatch,
      };
    } catch (err) {
      return err.toString();
    }
  }

  /**
     * Find a user's ID given their username
     * @param username: the string username of the user to search for
     * @returns a string containing the user's ID
     */
  async findUserId(username: string) : Promise<string> {
    try {
      const user = this.getCollection('user');

      const findUser = await user.find({ 'username': username }).limit(1).toArray();
      if (findUser.length === 1) {
        return findUser[0]._id;
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
      const neighborRequest = this.getCollection('neighbor_request');

      // Determine if this request has already been sent
      const neighborStatus = await this.neighborStatus(requestFrom, requestTo);

      if (neighborStatus.status === 'neighbor' || neighborStatus.status === 'requestReceived' || neighborStatus.status === 'requestSent') {
        return neighborStatus;
      }

      await neighborRequest.insertOne({'requestFrom': requestFrom, 'requestTo': requestTo});

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

      const neighborRequest = this.getCollection('neighbor_request');
      const requestSent = await neighborRequest.find({'requestFrom': user, 'requestTo': otherUser}).limit(1).toArray();
      if (requestSent.length === 1) {
        return { status: 'requestSent'};
      }

      const requestReceived = await neighborRequest.find({'requestFrom': otherUser, 'requestTo': user}).limit(1).toArray();
      if (requestReceived.length === 1) {
        return { status: 'requestReceived' };
      }
    
      return { status: 'unknown' };

    } catch (err) {
      return err.toString();
    }
  }


  // /**
  //  * List all users that have sent a request to the current user
  //  * @param user the string_id of the current user
  //  * @returns a ResponseEnvelope with an Array listing user string_id's and NeighborStatus
  //  */
  // async listRequestsReceived(user: string): Promise<ResponseEnvelope<Array<String>>> {
  //     try {
  //         const requests = this.getCollection('neighbor_request');

  //         const requestReceived = await requests.find({'requestTo': user}).toArray();

  //         const users = requestReceived.map(request => [request.requestTo, 'requestReceived']);
  //         // const users = requestReceived.forEach(request => console.log(request));

  //         return {
  //             isOK: true,
  //             response: users,
  //         }

  //     } catch (err) {
  //         return {
  //             isOK: false,
  //             message: err.toString(),
  //         }
  //     }
  // }

  // /**
  //  * List all users who have been sent a request by the current user
  //  * @param user the string_id of the current user
  //  * @returns a ResponseEnvelope with an Array listing user string_id's and NeighborStatus
  //  */
  // async listRequestsSent(user: string): Promise<ResponseEnvelope<Array<String>>> {
  //     try {
  //         const requests = this.getCollection('neighbor_request');

  //         const requestFrom = await requests.find({'requestFrom': user}).toArray();

  //         const users = requestFrom.map(request => [request.requestFrom, 'requestSent']);

  //         return {
  //             isOK: true,
  //             response: users,
  //         }

  //     } catch (err) {
  //         return {
  //             isOK: false,
  //             message: err.toString(),
  //         }
  //     }
  // }

  // /**
  //  * List all the neighbors of the current user
  //  * @param user the string_id of the current user
  //  * @returns a ResponseEnvelope with an Array listing user string_id's and NeighborStatus
  //  */
  // async listNeighbors(user: string): Promise<ResponseEnvelope<Array<String>>> {
  //     try {
  //         const neighbors = this.getCollection('neighbor_mappings');

  //         const neighborsList1 = await neighbors.find({'neighbor1': user}).toArray();

  //         const users1 = neighborsList1.map(neighbors => [neighbors.neighbor2, 'neighbor']);

  //         const neighborsList2 = await neighbors.find({'neighbor2': user}).toArray();

  //         const users2 = neighborsList2.map(neighbors => [neighbors.neighbor1, 'neighbor']);

  //         return {
  //             isOK: true,
  //             response: users1.concat(users2),
  //         }

  //     } catch (err) {
  //         return {
  //             isOK: false,
  //             message: err.toString(),
  //         }
  //     }
  // }

  /**
     * Check if the two users passed are currently neighbors
     * @param user1 the string_id of one user
     * @param user2 the string_id of the other user
     * @returns true if neighbors, false if not
     */
  async checkIfNeighbors(user1: string, user2: string): Promise<boolean | undefined> {
    try {
      const neighborMappings = this.getCollection('neighbor_mappings');

      const neighbors1 = await neighborMappings.find({'neighbor1': user1, 'neighbor2': user2}).limit(1).toArray();

      if (neighbors1.length === 1) {
        return true;
      }

      const neighbors2 = await neighborMappings.find({'neighbor1': user2, 'neighbor2': user1}).limit(1).toArray();

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

      const requests = this.getCollection('neighbor_request');
      // const findRequest = await requests.find({'requestFrom': userSent, 'requestTo': userAccepting}).limit(1).toArray();

      await requests.deleteOne({'requestFrom': userSent, 'requestTo': userAccepting});

      const neighborMappings = this.getCollection('neighbor_mappings');

      await neighborMappings.insertOne({'neighbor1': userSent, 'neighbor2': userAccepting});

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
      const requests = this.getCollection('neighbor_request');

      const findRequest = await this.neighborStatus(user, requestedUser);

      if (findRequest.status !== 'requestSent') {
        return findRequest;
      }

      await requests.deleteOne({'requestFrom': user, 'requestTo': requestedUser});

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
      const neighbors = this.getCollection('neighbor_mappings');
      const neighborStatus = await this.neighborStatus(user, neighbor);

      if (neighborStatus.status !== 'neighbor') {
        return neighborStatus;
      }

      const neighbor1 = await neighbors.find({'neighbor1': user, 'neighbor2': neighbor}).limit(1).toArray();

      if (neighbor1.length === 1) {
        await neighbors.deleteOne({'neighbor1': user, 'neighbor2': neighbor});
        return { status: 'unknown' };
      }

      await neighbors.deleteOne({'neighbor1': neighbor, 'neighbor2': user});
      return { status: 'unknown' };
            

    } catch (err) {
      return err.toString();
    }
  }
}