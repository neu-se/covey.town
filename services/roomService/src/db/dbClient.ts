/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
// eslint-disable-next-line import/no-extraneous-dependencies
import { MongoClient } from 'mongodb';

type User = {
  firstName: string,
  lastName: string,
  email: string,
  friends: string [],
  isOnline: boolean
};

type UserStatus = {
  email: string,
  isOnline: boolean
};

const dbName = 'coveyTown';
const collectionName = 'users';

async function getAllUserEmails(client:MongoClient){
  const userEmails =  await client.db(dbName).collection(collectionName).distinct('email');
  return userEmails;
}

async function userExistsWithEmail(client: MongoClient, email: string){
  const emails = await getAllUserEmails(client);
  return emails.includes(email);
}

async function getUserByEmail(client: MongoClient, email: string): Promise<User>{
  const user = await client.db(dbName).collection(collectionName).findOne({email});
  return user;
}

async function getOnlineStatus(client: MongoClient, email: string){
  const user = await getUserByEmail(client, email);
  return user.isOnline;
}
  
async function getAllFriends(client: MongoClient, email: string){
  const user:User = await getUserByEmail(client, email);
  const {friends} = user;
  const friendStatuses:UserStatus[] = await client.db(dbName).collection(collectionName).find( {email: { $in:friends }}).project({ email: 1, isOnline: 1, _id:0} ).toArray();
  return friendStatuses;
}
  
async function addFriend(client: MongoClient, email: string, friendEmail: string){
  const user:User = await getUserByEmail(client, email);
  const {friends} = user;
  const friendExists = await userExistsWithEmail(client, friendEmail);
  const shouldInsert = !friends.includes(friendEmail) && friendExists && (friendEmail !== email);
  if (shouldInsert){
    await client.db(dbName).collection(collectionName).updateOne({email}, { $push: {friends: friendEmail}});
  } else {
    console.log('friend not added');
  }
}

async function insertUser(client: MongoClient, user: User){
  const shouldInsert =  !await userExistsWithEmail(client, user.email);
  if (shouldInsert){
    const insertedUser = await client.db(dbName).collection(collectionName).insertOne(user);
    console.log('Inserted user: ', insertedUser);
  } else console.log('user already exists');
}
  
async function setStatusOnline(client: MongoClient, email: string){
  await client.db(dbName).collection(collectionName).updateOne({email}, { $set: {isOnline: true}});
}
  
async function setStatusOffline(client: MongoClient, email: string){
  await client.db(dbName).collection(collectionName).updateOne({email}, { $set: {isOnline: false}});
}
  
// async function removeFriend(client: MongoClient,email: string,friendEmail: string){
  
// }
  
async function main(){
  const uri = 'mongodb+srv://dbUser:dbUserPassword@cluster0.rdokz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  //   var record1 = { firstName: "George", lastName: "Russel", email: "gr@gmail.com", friends: ["cl@gmail.com"], isOnline: false};
  //     var record2 = { firstName: "Charles", lastName: "Leclerc", email: "cl@gmail.com", friends: ["ln@gmail.com","mv@gmail.com"], isOnline: false};
  //     var record3 = { firstName: "Lando", lastName: "Norris", email: "ln@gmail.com", friends: ["gr@gmail.com"], isOnline: false};
  //     var record4 = { firstName: "Max", lastName: "Verstappen", email: "mv@gmail.com", friends: ["gr@gmail.com","cl@gmail.com"], isOnline: false};
  //     var record5 = {firstName: "Sebastian", lastName: "Vettel", email: "sv@gmail.com", friends: [], isOnline: false}
  //     var record6 = {firstName: "Lewis", lastName: "Hamilton", email: "lh@gmail.com", friends:[], isOnline:true}
  //     var record7 = {firstName: "Danny", lastName: "Ric", email: "dr@gmail.com", friends:[], isOnline:true}
  // const record8 = {firstName: 'Carlos', lastName: 'Sainz', email: 'cs@gmail.com', friends:[], isOnline:true };
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log('connected ');
    const record8 = {firstName: 'Carlos', lastName: 'Sainz', email: 'cs@gmail.com', friends:[], isOnline:true };
    await insertUser(client, record8);
    // await addFriend(client, 'lh@gmail.com', 'cs@gmail.com');
    let s = await getOnlineStatus(client, 'cs@gmail.com');
    console.log('status:', s);
    await setStatusOffline(client, 'cs@gmail.com');
    s = await getOnlineStatus(client, 'cs@gmail.com');
    console.log('status:', s);



  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }

}

main();