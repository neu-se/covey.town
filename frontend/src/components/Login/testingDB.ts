/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
// eslint-disable-next-line import/no-extraneous-dependencies
import { MongoClient } from 'mongodb';

const DB_NAME = 'coveyTown';
  
const  COLLECTION_NAME = 'users';

export type User = {
  firstName: string,
  lastName: string,
  email: string,
  friends: string [],
  isOnline: boolean
};
  
export type UserStatus = {
  email: string,
  isOnline: boolean
};

export default class DbClient2{
  private readonly uri = 'mongodb+srv://dbUser:dbUserPassword@cluster0.rdokz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
  
  private client:MongoClient = new MongoClient(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });

  constructor(){
    this.connectToMongoDb();
  }

  async connectToMongoDb():Promise<void>{
    await this.client.connect();
  }

  async getAllUserEmails(): Promise<string[]>{
    const userEmails =  await this.client.db(DB_NAME).collection(COLLECTION_NAME).distinct('email');
    return userEmails;
  }

  async userExistsWithEmail(email: string): Promise<boolean>{
    const emails = await this.getAllUserEmails();
    return emails.includes(email);
  }

  async getUserByEmail( email: string): Promise<User>{
    const user = await this.client.db(DB_NAME).collection(COLLECTION_NAME).findOne({email});
    return user;
  }

  async getOnlineStatus( email: string):Promise<boolean>{
    const user = await this.getUserByEmail(email);
    return user.isOnline;
  }

  async getAllFriends( email: string):Promise<UserStatus[]>{
    const user:User = await this.getUserByEmail(email);
    const {friends} = user;
    const friendStatuses:UserStatus[] = await this.client.db(DB_NAME).collection(COLLECTION_NAME).find( {email: { $in:friends }}).project({ email: 1, isOnline: 1, _id:0} ).toArray();
    return friendStatuses;
  }

  async addFriend(email: string, friendEmail: string):Promise<void>{
    const user:User = await this.getUserByEmail(email);
    const {friends} = user;
    const friendExists = await this.userExistsWithEmail( friendEmail);
    const shouldInsert = !friends.includes(friendEmail) && friendExists && (friendEmail !== email);
    if (shouldInsert){
      await this.client.db(DB_NAME).collection(COLLECTION_NAME).updateOne({email}, { $push: {friends: friendEmail}});
    } else {
      console.log('friend not added');
    }
  }

  async insertUser(user: User):Promise<void>{
    const shouldInsert =  !await this.userExistsWithEmail(user.email);
    if (shouldInsert){
      const insertedUser = await this.client.db(DB_NAME).collection(COLLECTION_NAME).insertOne(user);
      console.log('Inserted user: ', insertedUser);
    } else console.log('user already exists');
  }

  async setStatusOnline(email: string):Promise<void>{
    await this.client.db(DB_NAME).collection(COLLECTION_NAME).updateOne({email}, { $set: {isOnline: true}});
  }
    
  async setStatusOffline(email: string):Promise<void>{
    await this.client.db(DB_NAME).collection(COLLECTION_NAME).updateOne({email}, { $set: {isOnline: false}});
  }

}