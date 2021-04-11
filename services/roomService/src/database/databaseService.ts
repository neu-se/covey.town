// note: this should be a singleton object. I just wrote this stuff to test the db connection. -CB
import { Knex, knex } from 'knex';

const config = {
  client: 'pg',
  version: '13.2',
  connection: {
    host: 'ec2-54-198-73-79.compute-1.amazonaws.com',
    user: 'icridlnxdbloht',
    password: '84d913975142cfa20467bb6606e88097a0411c2f1561b9c3c31920282ce6728c',
    database: 'dodhf94vtm4s9',
    ssl: { rejectUnauthorized: false },
  },
};

const knexInstance = knex(config);
// const knex = require('knex')({
//   client: 'pg',
//   version: '13.2',
//   connection: {
//     host : 'ec2-3-91-127-228.compute-1.amazonaws.com',
//     user : 'ciwjmrzhmxcnet',
//     password : '977f88be1657c4bb2d8550b52244988a7af11963160ff4e83506b7a52564682f',
//     database : 'd314d8k6ng2vrk',
//   },
// });

type TownData = {
  coveyTownID: string,
  friendlyName: string,
}

// functions interacting with Users
export async function updateUser(email: string) {
  const existing = await knexInstance('Users')
    .where('email', email);

  if (existing === undefined) {
    await knexInstance('Users')
      .insert({
        'email': email,
      });
  }
}

// Functions interacting with Towns
export async function getPublicTowns() {
  return await knexInstance('Towns')
    .select('coveyTownID', 'friendlyName')
    .where('isPublicallyListed', true);
}

export async function getTownByID(townID: string) {
  return await knexInstance('Towns')
    .select('coveyTownID', 'friendlyName', 'isPublicallyListed')
    .where('covveyTownID', townID);
}

export async function getTownPassword(townID: string) {
  const password = await knexInstance('Towns')
    .select('coveyTownPassword')
    .where('coveyTownID', townID);

  return password;
}

export async function addNewTown(townID: string, password: string, friendlyName: string, isPublicallyListed: boolean, email: string) {
  try {
    const userCheck = await updateUser(email);
    const resp = await knexInstance('Towns')
      .insert([{
        'coveyTownID': townID,
        'coveyTownPassword': password,
        'friendlyName': friendlyName,
        'isPublicallyListed': isPublicallyListed,
        'creator': email,
      }]);
    knexInstance.destroy();
    console.log('database response: ', resp.toString());
  } catch (err) {
    console.log(err.toString());
  }
}

export async function updateTown(townID: string, password: string, friendlyName: string, isPublicallyListed: boolean) {
  return knexInstance('Towns')
    .where('coveyTownID', townID)
    .andWhere('coveyTownPassword', password)
    .update({
      'friendlyName': friendlyName,
      'isPublicallyListed': isPublicallyListed,
    });
}

export async function deleteTown(townID: string, user: string) {
  return await knexInstance('Towns')
    .where('coveyTownID', townID)
    .andWhere('creator', user)
    .del();
}

// functions interacting with saved towns
export async function saveTown(user: string, townID: string) {
  // check if town aready saved
  const savedTown = knexInstance('SavedTowns')
    .where('coveyTownID', townID)
    .where('userEmail', user);

  if (savedTown !== undefined) {
    return await knexInstance('SavedTowns')
      .insert({
        'coveyTownID': townID,
        'userEmail': user,
      });
  }
  return 'town already exists';
}

export async function unsaveTown(user: string, townID: string) {
  return await knexInstance('SavedTowns')
    .where('userEmail', user)
    .andWhere('coveyTownID', townID)
    .del();
}

export async function getSavedTowns(user: string) {
  return await knexInstance('SavedTowns')
    .innerJoin('Towns', 'SavedTowns.coveyTownID', 'Towns.coveyTownID')
    .select('Towns.coveyTownID', 'Towns.friendlyName')
    .where('Savedtowns.userEmail', user);
}


// functions interacting with avatars
export async function updateAvatar(user: string, avatar: string) {
  return await knexInstance('Users')
    .where('email', user)
    .update({
      'currentAvatar': avatar,
    });