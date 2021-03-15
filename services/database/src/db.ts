const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://dev-user:cs4530COVEY@cluster-dev.vpr5c.mongodb.net/coveytown?retryWrites=true&w=majority";
import { ResponseEnvelope } from '../../roomService/src/requestHandlers/CoveyTownRequestHandlers';

export type NeighborStatus = 'unknown' | 'requestSent' | 'requestReceived' | 'neighbor';

export type AccountCreateResponse = {
    _id: string,
    username: string,
    password: string,
};


export default class DatabaseController {
    private client;

    constructor() {
        this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    }

    async connect() {
        await this.client.connect();
        console.log('connected to server');
    }

    close() {
        this.client.close();
    }

    /**
     * Returns an object with access to a collection in the coveytown db. 
     * @param collection name of the collection to open
     * @returns 
     */
    private getCollection(collection) {
        return this.client.db('coveytown').collection(collection);
    }

    /**
     * Creates an account using the passed username and password. 
     * @param username the username of the new user
     * @param password the password of the new user
     * @returns a ResponseEnvelope with an AccountCreateResponse
     */
    async insertUser(username: string, password: string) : Promise<ResponseEnvelope<AccountCreateResponse>> {
        try {
            if (password.length === 0 || password === '') {
                return {
                    isOK: false,
                    message: 'invalid password',
                }
            }

            const user = this.getCollection('user');
            const findUsername = await user.find({'username':username}).limit(1).toArray();
            if (findUsername.length > 0) {
                return {
                    isOK: false,
                    message: 'Username Taken',
                }

            }

            const accountCreateResponse = await user.insertOne({'username':username, 'password':password});

            console.log(accountCreateResponse.ops);
            return {
                isOK: true,
                response: accountCreateResponse.ops,
            }
        } catch (err) {
            console.log(err);
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
                return findUser[0]._id
            }

            return 'user_not_found';
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Sending a neighbor request. Attempts to send a neighbor_request from requestFrom to requestTo
     * @param requestFrom the string _id of the user sending the request
     * @param requestTo the string _id of the player receiving a request
     * @returns a ResponseEnvelope with a NeighborStatus
     */
    async sendRequest(requestFrom: string, requestTo: string) : Promise<ResponseEnvelope<NeighborStatus>> {
        try {
            const neighborRequest = this.getCollection('neighbor_request');

            // Determine if this request has already been sent
            const neighborStatus = await this.neighborStatus(requestFrom, requestTo);

            if (neighborStatus === 'neighbor' || neighborStatus === 'requestReceived' || neighborStatus === 'requestSent') {
                return {
                    isOK: true,
                    response: neighborStatus,
                }
            }

            await neighborRequest.insertOne({'requestFrom': requestFrom, 'requestTo': requestTo});

            return {
                isOK: true,
                response: 'requestSent',
            }
        } catch (err) {
            console.log(err);
        }

    }

    /**
     *  Function to determine the status of the relationship between the current user and the user being viewed
     *  
     * @param user username of current user
     * @param otherUser username of other user
     * @returns a NeighborStatus
     */
    async neighborStatus(user, otherUser): Promise<NeighborStatus> {
        try {
            const checkIfNeighbors = await this.checkIfNeighbors(user, otherUser);
            if (checkIfNeighbors) {
                return 'neighbor';
            }
    
            const neighborRequest = this.getCollection('neighbor_request');
            const requestSent = await neighborRequest.find({'requestFrom': user, 'requestTo': otherUser}).limit(1).toArray();
            if (requestSent.length === 1) {
                return 'requestSent';
            }
    
            const requestReceived = await neighborRequest.find({'requestFrom': otherUser, 'requestTo': user}).limit(1).toArray();
            if (requestReceived.length === 1) {
                return 'requestReceived';
            }
    
            return 'unknown';
        } catch (err) {
            console.log(err);
        }

    }


    /**
     * List all users that have sent a request to the current user
     * @param user username of the current user
     * @returns a ResponseEnvelope with an Array listing usernames and NeighborStatus
     */
    async listRequestsReceived(user) : Promise<ResponseEnvelope<Array<String>>> {
        try {
            const requests = this.getCollection('neighbor_request');

            const requestReceived = await requests.find({'requestTo': user}).toArray();

            // const users = requestReceived.map(request => [request.requestFrom, 'requestReceived']);
            const users = requestReceived.forEach(request => console.log(request));
            return {
                isOK: true,
                response: users,
            }
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * List all users who have been sent a request by the current user
     * @param user username of the current user
     * @returns 
     */
    async listRequestsSent(user) : Promise<ResponseEnvelope<Array<String>>> {
        try {
            const requests = this.getCollection('neighbor_request');

            const requestFrom = await requests.find({'requestFrom': user}).toArray();

            const users = requestFrom.map(request => [request.requestFrom, 'requestSent']);

            return {
                isOK: true,
                response: users,
            }
        } catch (err) {
            console.log(err);
        }
    }
    
    /**
     * List all the neighbors of the current user
     * @param user username of the current user
     * @returns 
     */
    async listNeighbors(user) : Promise<ResponseEnvelope<Array<String>>> {
        try {
            const neighbors = this.getCollection('neighbor_mappings');

            const neighborsList1 = await neighbors.find({'neighbor1': user}).toArray();

            const users1 = neighborsList1.map(neighbors => [neighbors.neighbor2, 'neighbor']);

            const neighborsList2 = await neighbors.find({'neighbor2': user}).toArray();

            const users2 = neighborsList2.map(neighbors => [neighbors.neighbor1, 'neighbor']);

            return {
                isOK: true,
                response: users1.concat(users2),
            }
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Check if the two users passed are currently neighbors
     * @param user1 username of one user
     * @param user2 username of the other user
     * @returns true if neighbors, false if not
     */
    async checkIfNeighbors(user1, user2) : Promise<boolean> {
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
            console.log(err);
        }
    }

    /**
     * Accepts the request for the user who received one
     * @param userAccepting the user who received the request and is accepting it
     * @param userSent the user who sent the request
     * @returns a response evnelope with the NeighborStatus of the two users
     */
    async acceptRequest(userAccepting, userSent) : Promise<ResponseEnvelope<NeighborStatus>> {
        try {
            const checkIfNeighbors = await this.checkIfNeighbors(userAccepting, userSent);
            if (checkIfNeighbors) {
                return {
                    isOK: false,
                    message: 'neighbor',
                }
            }

            const requests = this.getCollection('neighbor_request');
            const findRequest = await requests.find({'requestFrom': userSent, 'requestTo': userAccepting}).limit(1).toArray();

            if (findRequest.length !== 1) {
                return {
                    isOK: false,
                    message: 'Request not found',
                }
            }

            await requests.delete({'requestFrom': userSent, 'requestTo': userAccepting});

            const neighborMappings = this.getCollection('neighbor_mappings');

            await neighborMappings.insert({'neighbor1': userSent, 'neighbor2': userAccepting});

            return {
                isOK: true,
                response: 'neighbor',
            }

        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Removes the neighbor request sent from user to requestedUser
     * @param user username of the current user
     * @param requestedUser username of the requestedUser
     * @returns a ResponseEnvelope with a Neighbor Status
     */
    async removeNeighborRequest(user, requestedUser) : Promise<ResponseEnvelope<NeighborStatus>> {
        try {
            const requests = this.getCollection('neighbor_request');

            const findRequest = await requests.find({'requestFrom': user, 'requestTo': requestedUser}).limit(1).toArray();

            if (findRequest === 0) {
                // Means no record of them being neighbors, not sure what to respond here
                return {
                    isOK: false,
                    message: 'Not Requested',
                }
            }

            await requests.delete({'requestFrom': user, 'requestTo': requestedUser});

            return {
                isOK: true,
                response: 'unknown',
            }
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Removes the neighbor relationship between the user and neighbor
     * @param user username of the current user
     * @param neighbor username of the neighbor to remove
     * @returns a ResponseEnvelope with a NeighborStatus
     */
    async removeNeighbor(user, neighbor) : Promise<ResponseEnvelope<NeighborStatus>> {
        try {
            const neighbors = this.getCollection('neighbor_mappings');
            const checkIfNeighbors = await this.checkIfNeighbors(user, neighbor);
            if (!checkIfNeighbors) {
                // Same as above, unsure of proper response here 
                return {
                    isOK: false,
                    message: 'Not Neighbors',
                }
            }

            const neighbor1 = await neighbors.find({'neighbor1': user, 'neighbor2': neighbor}).limit(1).toArray();

            if (neighbor1.length === 1) {
                await neighbors.delete({'neighbor1': user, 'neighbor2': neighbor});

                return {
                    isOK: true,
                    response: 'unknown',
                }
            }

            const neighbor2 = await neighbors.find({'neighbor1': neighbor, 'neighbor2': user}).limit(1).toArray();

            if (neighbor2.length === 1) {
                await neighbors.delete({'neighbor1': neighbor, 'neighbor2': user});

                return {
                    isOK: true,
                    response: 'unknown',
                }
            }

            return {
                isOK: false,
                message: 'unknown error',
            }


        } catch (err) {
            console.log(err);
        }
    }

} 









