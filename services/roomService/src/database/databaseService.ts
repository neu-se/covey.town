// note: this should be a singleton object. I just wrote this stuff to test the db connection. -CB
import { Knex, knex } from 'knex';
import { db } from './knexfile';

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

export type TownData = {
  coveyTownID: string,
  coveyTownPassword: string,
  friendlyName: string,
  isPublicallyListed: boolean,
};

export type AllTownResponse = {
  coveyTownID: string,
};

export type TownListingInfo = {
  coveyTownID: string,
  friendlyName: string,
};

// functions interacting with Users
export async function updateUser(email: string) {
  let count = 0;
  const existing = await db('Users')
    .where('email', email)
    .then((rows: any[]) => {
      count = rows.length;
      // for (let row of rows) {
      //   count += 1;
      // }
    });

  if (count === 0) {
    await db('Users')
      .insert({
        'email': email,
      });
  }
}

// Functions interacting with Towns
export async function getPublicTowns(): Promise<TownListingInfo[]> {
  const results: TownListingInfo[] = [];
  await db('Towns')
    .select('coveyTownID', 'friendlyName')
    .where('isPublicallyListed', true)
    .then((rows: any) => {
      for (let row of rows) {
        results.push({ coveyTownID: row['coveyTownID'], friendlyName: row['friendlyName'] });
      }
    });
  return results;
}

export async function getAllTowns(): Promise<AllTownResponse[]> {
  const results: AllTownResponse[] = [];
  await db('Towns')
    .select('coveyTownID')
    .then((rows: any) => {
      for (let row of rows) {
        results.push({ coveyTownID: row['coveyTownID']});
      }
    });
  return results;
}

export async function getTownByID(townID: string): Promise<TownData> {
  const result = await db('Towns')
    .select('coveyTownID', 'coveyTownPassword', 'friendlyName', 'isPublicallyListed')
    .where('coveyTownID', townID)
    .then((rows: any) => {
      const town = {
        coveyTownID: rows[0]['coveyTownID'],
        coveyTownPassword: rows[0]['coveyTownPassword'],
        friendlyName: rows[0]['friendlyName'],
        isPublicallyListed: rows[0]['isPublicallyListed'],
      };
      return town;
    });
  return result;
}

export async function addNewTown(townID: string, password: string, friendlyName: string, isPublicallyListed: boolean, email: string) {
  try {
    const resp = await db('Towns')
      .insert([{
        'coveyTownID': townID,
        'coveyTownPassword': password,
        'friendlyName': friendlyName,
        'isPublicallyListed': isPublicallyListed,
        'creator': email,
      }]);
    console.log('database response: ', resp.toString());
  } catch (err) {
    console.log(err.toString());
  }
}

export async function updateTownName(townID: string, password: string, friendlyName: string) {
  return db('Towns')
    .where('coveyTownID', townID)
    .andWhere('coveyTownPassword', password)
    .update({
      'friendlyName': friendlyName,
    });
}

export async function updateTownPublicStatus(townID: string, password: string, isPublicallyListed: boolean) {
  return db('Towns')
    .where('coveyTownID', townID)
    .andWhere('coveyTownPassword', password)
    .update({
      'isPublicallyListed': isPublicallyListed,
    });
}

export async function deleteTown(townID: string, password: string) {
  return db('Towns')
    .where('coveyTownID', townID)
    .andWhere('coveyTownPassword', password)
    .del();
}

// functions interacting with saved towns
export async function saveTown(user: string, townID: string) {
  // check if town aready saved
  const savedTown = db('SavedTowns')
    .where('coveyTownID', townID)
    .where('userEmail', user);

  if (savedTown !== undefined) {
    return db('SavedTowns')
      .insert({
        'coveyTownID': townID,
        'userEmail': user,
      });
  }
  return 'town already exists';
}

export async function unsaveTown(user: string, townID: string) {
  return db('SavedTowns')
    .where('userEmail', user)
    .andWhere('coveyTownID', townID)
    .del();
}

export async function getSavedTowns(user: string) {
  return db('SavedTowns')
    .innerJoin('Towns', 'SavedTowns.coveyTownID', 'Towns.coveyTownID')
    .select('Towns.coveyTownID', 'Towns.friendlyName')
    .where('Savedtowns.userEmail', user);
}


// functions interacting with avatars
export async function updateAvatar(user: string, avatar: string) {
  return db('Users')
    .where('email', user)
    .update({
      'currentAvatar': avatar,
    });
}