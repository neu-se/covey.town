// note: this should be a singleton object. I just wrote this stuff to test the db connection. -CB
import db from './knexfile';

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

export type UserInfo = {
  email: string,
  username: string,
  nickname: string,
  currentAvatar: string,
};

// functions interacting with Users
export async function updateUser(email: string): Promise<void>  {
  let count = 0;
  await db('Users')
    .where('email', email)
    .then((rows: any[]) => {
      count = rows.length;
    });

  if (count === 0) {
    await db('Users')
      .insert({
        'email': email,
      });
  }
}

export async function getAllUserInfo(email: string): Promise<UserInfo> {
  return db('Users')
    .where('email', email)
    .then((rows: any[]) => {
      const user = rows[0];
      return { email: user.email, username: user.username, nickname: user.nickname, currentAvatar: user.currentAvatar };
    });
}

export async function deleteUser(email: string): Promise<void> {
  await db('Users')
    .where('email', email)
    .del();

}

// Functions interacting with Towns
export async function getPublicTowns(): Promise<TownListingInfo[]> {
  const results: TownListingInfo[] = [];
  await db('Towns')
    .select('coveyTownID', 'friendlyName')
    .where('isPublicallyListed', true)
    .then((rows: any[]) => {
      rows.forEach(row => results.push({ coveyTownID: row.coveyTownID, friendlyName: row.friendlyName }));
    });
  return results;
}

export async function getAllTowns(): Promise<AllTownResponse[]> {
  const results: AllTownResponse[] = [];
  await db('Towns')
    .select('coveyTownID')
    .then((rows: any[]) => {
      rows.forEach(row => results.push({ coveyTownID: row.coveyTownID }));
    });
  return results;
}

export async function getTownByID(townID: string): Promise<TownData | void> {
  const result = await db('Towns')
    .select('coveyTownID', 'coveyTownPassword', 'friendlyName', 'isPublicallyListed')
    .where('coveyTownID', townID)
    .then((rows: any[]) => {
      const row = rows[0];
      let town;
      if (row !== undefined) {
        town = {

          coveyTownID: row.coveyTownID,
          coveyTownPassword: row.coveyTownPassword,
          friendlyName: row.friendlyName,
          isPublicallyListed: row.isPublicallyListed,
        };
      }
      return town;
    });
  return result;
}

export async function addNewTown(townID: string, password: string, friendlyName: string, isPublicallyListed: boolean, email: string): Promise<void> {

  await db('Towns')
    .insert([{
      'coveyTownID': townID,
      'coveyTownPassword': password,
      'friendlyName': friendlyName,
      'isPublicallyListed': isPublicallyListed,
      'creator': email,
    }]);

}

export async function updateTownName(townID: string, password: string, friendlyName: string): Promise<void> {
  await db('Towns')
    .where('coveyTownID', townID)
    .andWhere('coveyTownPassword', password)
    .update({
      'friendlyName': friendlyName,
    });
}

export async function updateTownPublicStatus(townID: string, password: string, isPublicallyListed: boolean): Promise<void> {
  await db('Towns')
    .where('coveyTownID', townID)
    .andWhere('coveyTownPassword', password)
    .update({
      'isPublicallyListed': isPublicallyListed,
    });
}

export async function deleteTown(townID: string, password: string): Promise<void> {
  await db('Towns')
    .where('coveyTownID', townID)
    .andWhere('coveyTownPassword', password)
    .del();
}

// functions interacting with saved towns
export async function saveTown(user: string, townID: string): Promise<void> {
  // check if town aready saved
  const savedTown = await db('SavedTowns')
    .where('coveyTownID', townID)
    .where('userEmail', user);

  if (savedTown !== undefined) {
    await db('SavedTowns')
      .insert({
        'coveyTownID': townID,
        'userEmail': user,
      });
  }
}

export async function unsaveTown(user: string, townID: string): Promise<void> {
  await db('SavedTowns')
    .where('userEmail', user)
    .andWhere('coveyTownID', townID)
    .del();
}

export async function getSavedTowns(user: string): Promise<TownListingInfo[]> {
  return db('SavedTowns')
    .innerJoin('Towns', 'SavedTowns.coveyTownID', 'Towns.coveyTownID')
    .select('Towns.coveyTownID as townID', 'Towns.friendlyName as friendlyName')
    .where('Savedtowns.userEmail', user)
    .then((returnedTowns: any[]) => {
      const townList: TownListingInfo[] = [];
      returnedTowns.forEach(town => {
        townList.push({ coveyTownID: town.townID, friendlyName: town.friendlyName });
      });
      return townList;
    });
}

// functions interacting with avatars
export async function updateAvatar(user: string, avatar: string): Promise<void> {
  await db('Users')
    .where('email', user)
    .update({
      'currentAvatar': avatar,
    });
}

export async function getCurrentAvatar(user: string): Promise<string> {
  return db('Users')
    .select('currentAvatar')
    .where('email', user)
    .then((rows: any[]) => {
      const response = rows[0];
      return response.currentAvatar;
    });
}

