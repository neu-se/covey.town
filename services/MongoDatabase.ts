const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost/coveyuserdatabase";
// Atlas URL  - replace UUU with user, PPP with password, XXX with hostname
const url =
  "mongodb+srv://testUser:P@123456@coveytownusers.w8gis.mongodb.net/test";
let db;
const collection = db.collection('users');

async function userList() {
  const users = await db.collection('users').find({}).toArray();
  return users;
}


async function connectToDb() {
  const user = new MongoClient(url, { useNewUrlParser: true });
  await user.connect();
  console.log("Connected to MongoDB at", url);
  const db = user.db();
}

function getDb() {
  return db;
}

// function getUser(name: string, ) {
//   const returnUser = await db.collection('users').
// }



