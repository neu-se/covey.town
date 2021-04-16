import dotenv from 'dotenv';
import { Client } from 'pg';
import { JoinedTown, UserInfo } from '../AccountTypes';
import {
  resetUser,
  getUserByID,
  upsertUser,
  deleteUser,
} from './UserPreferencesRepository';

dotenv.config();
const testClient = new Client({
  connectionString: process.env.DATABASE_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false,
  },
});

/**
 * Mock TownInfo used throughout the tests
 */
const town1: JoinedTown = {
  townID: '1',
  positionX: 0,
  positionY: 0,
};

const town2: JoinedTown = {
  townID: '2',
  positionX: 5,
  positionY: 10,
};

const town3: JoinedTown = {
  townID: '3',
  positionX: 10,
  positionY: 10,
};

/**
 * Mock User Info used throughout the tests
 */
const jeminInfo: UserInfo = {
  userID: 'jemin1',
  username: 'jem1',
  email: 'jemin@test.com',
  useAudio: false,
  useVideo: false,
  towns: [],
};

const jeminInfoUpdate: UserInfo = {
  userID: 'jemin1',
  username: 'jem1',
  email: 'jemin@test.com',
  useAudio: false,
  useVideo: false,
  towns: [town1],
};

const kyleInfo: UserInfo = {
  userID: 'kyle1',
  username: 'kyle1',
  email: 'kyle@test.com',
  useAudio: true,
  useVideo: false,
  towns: [],
};

const johnInfo: UserInfo = {
  userID: 'john1',
  username: 'john1',
  email: 'john@test.com',
  useAudio: false,
  useVideo: true,
  towns: [town1, town2],
};

const johnInfoUpdate: UserInfo = {
  userID: 'john1',
  username: 'john1',
  email: 'john@test.com',
  useAudio: true,
  useVideo: true,
  towns: [town3, town1, town2],
};

const tatiInfo: UserInfo = {
  userID: 'tatiana1',
  username: 'tati1',
  email: 'tati@test.com',
  useAudio: true,
  useVideo: true,
  towns: [town3],
};

const tatiInfoUpdate: UserInfo = {
  userID: 'tatiana1',
  username: 'tati1',
  email: 'tati@test.com',
  useAudio: true,
  useVideo: true,
  towns: [],
};

describe('upsertUser, getUserById, resetUser', () => {
  beforeAll(done => {
    done();
    testClient.connect();
  });
  afterAll(done => {
    testClient.end();
    done();
  });
  it('inserts, retrieves, and deletes a user (that has no joined town) when given a user in the database', async () => {
    const userID = 'kyle1';
    // Inserts the user into the user_preferences table of the database
    const insertUser = await upsertUser(kyleInfo);
    expect(insertUser).toBe(true);
    
    // Checks to see if the user was properly added to the database
    const userInfo = await getUserByID(userID);
    expect(userInfo).toStrictEqual(kyleInfo);

    // delete the user from the database
    const resettedUser = await resetUser(userID);
    expect(resettedUser).toBe(true);

    // delete the user from the database
    const deletedUser = await deleteUser(userID);
    expect(deletedUser).toBe(true);
  });

  it('inserts, updates, retrieve, and deletes a user (that has no joined town) when given a user in the database', async () => {
    const userID = 'jemin1';
    // Inserts the user into the user_preferences table of the database
    const insertUser = await upsertUser(jeminInfo);
    expect(insertUser).toBe(true);

    // Checks to see if the user was properly added to the database
    const userInfo = await getUserByID(userID);
    expect(userInfo).toStrictEqual(jeminInfo);

    // Updates the given user
    const updateUser = await upsertUser(jeminInfoUpdate); 
    expect(updateUser).toBe(true);

    // Checks to see if the user was properly updated in the database
    const updatedUserInfo = await getUserByID(userID);
    expect(updatedUserInfo).toStrictEqual(jeminInfoUpdate);

    // reset the user's saved preferences from the database
    const resettedUser = await resetUser(userID);
    expect(resettedUser).toBe(true);

    // delete the user from the database
    const deletedUser = await deleteUser(userID);
    expect(deletedUser).toBe(true);
  });

  it('inserts, updates, retrieve, and deletes a user (that has joined town) when given a user in the database', async () => {
    const userID = 'john1';

    // Inserts the user into the user_preferences table of the database
    const insertUser = await upsertUser(johnInfo);
    expect(insertUser).toBe(true);

    // Checks to see if the user was properly added to the database
    const userInfo = await getUserByID(userID);
    expect(userInfo).toStrictEqual(johnInfo);

    // Updates the given user
    const updateUser = await upsertUser(johnInfoUpdate); 
    expect(updateUser).toBe(true);

    // Checks to see if the user was properly updated in the database
    const updatedUserInfo = await getUserByID(userID);
    expect(updatedUserInfo).toStrictEqual(johnInfoUpdate);

    // reset the user's saved preferences from the database
    const resettedUser = await resetUser(userID);
    expect(resettedUser).toBe(true);

    // delete the user from the database
    const deletedUser = await deleteUser(userID);
    expect(deletedUser).toBe(true);
  });

  it('inserts, updates, retrieves, and deletes a user (that has joined town) when given a user in the database', async () => {
    const userID = 'tatiana1';
    // Inserts the user into the user_preferences table of the database
    const insertUser = await upsertUser(tatiInfo);
    expect(insertUser).toBe(true);

    // Checks to see if the user was properly added to the database
    const userInfo = await getUserByID(userID);
    expect(userInfo).toStrictEqual(tatiInfo);

    // Updates the given user
    const updateUser = await upsertUser(tatiInfoUpdate); 
    expect(updateUser).toBe(true);

    // Checks to see if the user was properly updated in the database
    const updatedUserInfo = await getUserByID(userID);
    expect(updatedUserInfo).toStrictEqual(tatiInfo);

    // delete the user from the database
    const deletedUser = await resetUser(userID);
    expect(deletedUser).toBe(true);
  });
});
