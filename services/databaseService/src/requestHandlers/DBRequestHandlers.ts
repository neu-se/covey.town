import { MongoClient } from 'mongodb';

const DB_NAME = 'coveyTown';
  
const  COLLECTION_NAME = 'users';

export interface User {
  firstName: string,
  lastName: string,
  email: string,
  friends: string [],
  isOnline: boolean
}
  
export interface UserStatus {
  email: string,
  isOnline: boolean
}

/**
 * Envelope that wraps any response from the server
 */
export interface ResponseEnvelope<T> {
  isOK: boolean;
  message?: string;
  response?: T;
}

export interface AddUserRequest{
  user: User,
}

export interface UserEmailRequest {
  email: string,
}

export interface StatusChangeRequest {
  email: string,
  status: boolean,
}

export interface AddFriendRequest{
  email: string,
  friendEmail: string,
}

export interface RemoveFriendRequest {
  email: string, 
  friendEmail: string,
}

export default class MongoClientFactory{
  private uri = 'mongodb+srv://dbUser:dbUserPassword@cluster0.rdokz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
  
  private static _instance:MongoClientFactory;

  static getInstance(): MongoClientFactory {
    if (MongoClientFactory._instance === undefined) {
      MongoClientFactory._instance = new MongoClientFactory();
    }
    return MongoClientFactory._instance;
  }

  public getMongoClient():MongoClient{
    const client:MongoClient = new MongoClient(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
    client.connect();
    return client;
  }
}

export async function userExistsHandler(requestData: UserEmailRequest):Promise<ResponseEnvelope<boolean>> {
  const client:MongoClient = MongoClientFactory.getInstance().getMongoClient();
  const userEmails =  await client.db(DB_NAME).collection(COLLECTION_NAME).distinct('email');
  client.close();
  const result = requestData.email in userEmails;
  return {
    isOK: true,
    response: result,
  };
}

export async function getFriendsHandler( requestData: UserEmailRequest):Promise<ResponseEnvelope<UserStatus[]>>{
  const client:MongoClient = MongoClientFactory.getInstance().getMongoClient();
  const user = await client.db(DB_NAME).collection(COLLECTION_NAME).findOne({email:requestData.email});
  const {friends} = user;
  const friendStatuses:UserStatus[] = await client.db(DB_NAME).collection(COLLECTION_NAME).find( {email: { $in:friends }}).project({ email: 1, isOnline: 1, _id:0} ).toArray();
  client.close();
  return {
    isOK: true,
    response: friendStatuses,
  };
}

export async function getStatusHandler( requestData: UserEmailRequest):Promise<ResponseEnvelope<boolean>>{
  const client:MongoClient = MongoClientFactory.getInstance().getMongoClient();
  const user = await client.db(DB_NAME).collection(COLLECTION_NAME).findOne({email: requestData.email});
  return {
    isOK: true,
    response:user.isOnline,
  };
}

export async function setStatusHandler(requestData: StatusChangeRequest):Promise<void>{
  const client:MongoClient = MongoClientFactory.getInstance().getMongoClient();
  await client.db(DB_NAME).collection(COLLECTION_NAME).updateOne({email: requestData.email}, { $set: {isOnline: requestData.status}});
  client.close();
}

export async function addFriendHandler(requestData: AddFriendRequest):Promise<ResponseEnvelope<Record<string, null>>>{
  const client:MongoClient = MongoClientFactory.getInstance().getMongoClient();
  const user = await client.db(DB_NAME).collection(COLLECTION_NAME).findOne({email: requestData.email});
  const {friends} = user;
  // check if the person with this email-id exists in the database
  const userEmails =  await client.db(DB_NAME).collection(COLLECTION_NAME).distinct('email');
  const friendExists = requestData.friendEmail in userEmails;

  // check if the friend has already been added
  const shouldInsert = !friends.includes(requestData.friendEmail) && friendExists && (requestData.friendEmail !== requestData.email);
  if (shouldInsert){
    await client.db(DB_NAME).collection(COLLECTION_NAME).updateOne({email: requestData.email}, { $push: {friends: requestData.friendEmail}});
    client.close();
    return {
      isOK: true,
      response: {},
      message: 'friend added to your list',
    };
  } 
  client.close();
  return {
    isOK: false,
    response: {},
    message: 'friend not added: either they are not in the database or they are already in your lists.',
  };
}

export async function addUserHandler(requestData: AddUserRequest):Promise<ResponseEnvelope<Record<string, null>>>{
  const client:MongoClient = MongoClientFactory.getInstance().getMongoClient();
  const userEmails =  await client.db(DB_NAME).collection(COLLECTION_NAME).distinct('email');
  const shouldInsert =  !(requestData.user.email in userEmails);
  if (shouldInsert){
    await client.db(DB_NAME).collection(COLLECTION_NAME).insertOne(requestData.user);
    client.close();
    return {
      isOK: true,
      message: 'Added user',
    };
  } 
  client.close();
  return {
    isOK: false,
    message: 'user was not added',
  };
}

// export async function removeFriendHandler(requestData: RemoveFriendRequest): Promise<ResponseEnvelope<Record<string, null>>>{
//   const client:MongoClient = MongoClientFactory.getInstance().getMongoClient();

// }