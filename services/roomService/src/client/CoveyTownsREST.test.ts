import Express from 'express';
import CORS from 'cors';
import http from 'http';
import { nanoid } from 'nanoid';
import assert from 'assert';
import { AddressInfo } from 'net';
import db from '../database/knexfile';
import { logUser, deleteUser } from '../database/databaseService';

import TownsServiceClient, { TownListResponse } from './TownsServiceClient';
import addTownRoutes from '../router/towns';

type TestTownData = {
  friendlyName: string, coveyTownID: string,
  isPubliclyListed: boolean, townUpdatePassword: string, publicStatus?: string,
};

function expectTownListMatches(towns: TownListResponse, town: TestTownData) {
  const matching = towns.towns.find(townInfo => townInfo.coveyTownID === town.coveyTownID);
  if (town.isPubliclyListed) {
    expect(matching)
      .toBeDefined();
    assert(matching);
    expect(matching.friendlyName)
      .toBe(town.friendlyName);
  } else {
    expect(matching)
      .toBeUndefined();
  }
}

function expectSavedTownListMatches(towns: TownListResponse, town: TestTownData) {
  const matching = towns.towns.find(townInfo => townInfo.coveyTownID === town.coveyTownID);

  expect(matching)
    .toBeDefined();
  assert(matching);
  expect(matching.friendlyName)
    .toBe(town.friendlyName);

}

describe('TownsServiceAPIREST', () => {
  let server: http.Server;
  let apiClient: TownsServiceClient;

  async function createTownForTesting(friendlyNameToUse?: string, isPublic = false, creator = 'TEST_USER'): Promise<TestTownData> {
    const friendlyName = friendlyNameToUse !== undefined ? friendlyNameToUse :
      `${isPublic ? 'Public' : 'Private'}TestingTown=${nanoid()}`;
    const ret = await apiClient.createTown({
      friendlyName,
      isPubliclyListed: isPublic,
      creator,
    });
    return {
      friendlyName,
      isPubliclyListed: isPublic,
      coveyTownID: ret.coveyTownID,
      townUpdatePassword: ret.coveyTownPassword,
    };
  }

  beforeAll(async () => {
    const app = Express();
    app.use(CORS());
    server = http.createServer(app);

    addTownRoutes(server, app);
    await server.listen();
    const address = server.address() as AddressInfo;

    apiClient = new TownsServiceClient(`http://127.0.0.1:${address.port}`);

    await logUser('TEST_USER');
    await logUser('TEST_USER_2');
  });
  afterAll(async () => {
    await server.close();
    await deleteUser('TEST_USER');
    await deleteUser('TEST_USER_2');
    await db.destroy();
  });

  describe('CoveyTownUserAPI', () => {
    it('allows for users to be created only once', async () => {
      await apiClient.logUser({ email: 'USER_TEST' });
      await apiClient.logUser({ email: 'USER_TEST' });
      const numUsers = await db('Users').where('email', 'USER_TEST').then((res: any[]) =>
        res.length);
      expect(numUsers)
        .toBe(1);
    });
    it('allows for already created users to be deleted', async () => {
      await apiClient.deleteUser({ email: 'USER_TEST' });
      const numUsers = await db('Users').where('email', 'USER_TEST').then((res: any[]) =>
        res.length);
      expect(numUsers)
        .toBe(0);
    });
    it('allows for getting all recorded info for user with given email', async () => {
      await apiClient.logUser({ email: 'USER_INFO_TEST' });
      const info = await apiClient.getUserInfo({ email: 'USER_INFO_TEST' });
      expect(info.currentAvatar)
        .toBe('misa'); // default avatar
      expect(info.email)
        .toBe('USER_INFO_TEST');
    });
    it('allows first/last names to be updated', async () => {
      await apiClient.updateUser({
        email: 'USER_INFO_TEST',
        firstName: 'JOHN',
        lastName: 'DOE',
      });
      const info = await apiClient.getUserInfo({ email: 'USER_INFO_TEST' });
      expect(info.firstName)
        .toBe('JOHN');
      expect(info.lastName)
        .toBe('DOE');
    });
    it('will accept undefined values for first/last name to update', async () => {
      // first name undefined
      await apiClient.updateUser({
        email: 'USER_INFO_TEST',
        lastName: 'SMITH',
      });
      let info = await apiClient.getUserInfo({ email: 'USER_INFO_TEST' });
      expect(info.firstName)
        .toBe('JOHN');
      expect(info.lastName)
        .toBe('SMITH');

      // last name undefined
      await apiClient.updateUser({
        email: 'USER_INFO_TEST',
        firstName: 'JANE',
      });
      info = await apiClient.getUserInfo({ email: 'USER_INFO_TEST' });
      expect(info.firstName)
        .toBe('JANE');
      expect(info.lastName)
        .toBe('SMITH');

      // both undefined
      await apiClient.updateUser({
        email: 'USER_INFO_TEST',
      });
      info = await apiClient.getUserInfo({ email: 'USER_INFO_TEST' });
      expect(info.firstName)
        .toBe('JANE');
      expect(info.lastName)
        .toBe('SMITH');

      // same as existing
      await apiClient.updateUser({
        email: 'USER_INFO_TEST',
        firstName: 'JANE',
        lastName: 'SMITH',
      });
      info = await apiClient.getUserInfo({ email: 'USER_INFO_TEST' });
      expect(info.firstName)
        .toBe('JANE');
      expect(info.lastName)
        .toBe('SMITH');

      // clean up
      await apiClient.deleteUser({ email: 'USER_INFO_TEST' });
    });
  });
  describe('CoveyTownCreateAPI', () => {
    it('Allows for multiple towns with the same friendlyName', async () => {
      const firstTown = await createTownForTesting();
      const secondTown = await createTownForTesting(firstTown.friendlyName);
      expect(firstTown.coveyTownID)
        .not
        .toBe(secondTown.coveyTownID);
    });
    it('Prohibits a blank friendlyName', async () => {
      try {
        await createTownForTesting('');
        fail('createTown should throw an error if friendly name is empty string');
      } catch (err) {
        // OK
      }
    });
  });

  describe('CoveyTownAvatarAPI', () => {
    it('Allows access to a users current avatar', async () => {
      const currentAvatar = await apiClient.getCurrentAvatar({ email: 'TEST_USER' });
      expect(currentAvatar)
        .toBe('misa');
    });
    it('Allows for a users avatar to be updated', async () => {
      await apiClient.updateUserAvatar({ email: 'TEST_USER', avatar: 'catgirl' });
      let currentAvatar = await apiClient.getCurrentAvatar({ email: 'TEST_USER' });
      expect(currentAvatar)
        .toBe('catgirl');
      await apiClient.updateUserAvatar({ email: 'TEST_USER', avatar: 'childactor' });
      currentAvatar = await apiClient.getCurrentAvatar({ email: 'TEST_USER' });
      expect(currentAvatar)
        .toBe('childactor');
    });
  });

  describe('CoveyTownSaveTownAPI', () => {
    it('Allows for both public and private towns to be saved', async () => {
      const firstTown = await createTownForTesting(undefined, true);
      const secondTown = await createTownForTesting(undefined, false);
      await apiClient.saveTown({ email: 'TEST_USER', townID: firstTown.coveyTownID });
      await apiClient.saveTown({ email: 'TEST_USER', townID: secondTown.coveyTownID });
      const savedTowns = await apiClient.listSavedTowns({ email: 'TEST_USER' });
      expectSavedTownListMatches(savedTowns, firstTown);
      expectSavedTownListMatches(savedTowns, secondTown);
    });
    it('allows towns to be unsaved, and removes them from the list', async () => {
      const firstTown = await createTownForTesting(undefined, true);
      const secondTown = await createTownForTesting(undefined, false);
      await apiClient.saveTown({ email: 'TEST_USER', townID: firstTown.coveyTownID });
      await apiClient.saveTown({ email: 'TEST_USER', townID: secondTown.coveyTownID });
      let savedTowns = await apiClient.listSavedTowns({ email: 'TEST_USER' });
      expectSavedTownListMatches(savedTowns, firstTown);
      expectSavedTownListMatches(savedTowns, secondTown);
      await apiClient.deleteSavedTown({ email: 'TEST_USER', townID: firstTown.coveyTownID });
      savedTowns = await apiClient.listSavedTowns({ email: 'TEST_USER' });
      try {
        expectSavedTownListMatches(savedTowns, firstTown);
        fail('should not keep unsaved towns');
      } catch (err) {
        //  OK- error expected
      }
      expectSavedTownListMatches(savedTowns, secondTown);
    });
    it('only unsaves a town for the specified user', async () => {
      const firstTown = await createTownForTesting();
      await apiClient.saveTown({ email: 'TEST_USER', townID: firstTown.coveyTownID });
      await apiClient.saveTown({ email: 'TEST_USER_2', townID: firstTown.coveyTownID });
      let savedTowns = await apiClient.listSavedTowns({ email: 'TEST_USER' });
      expectSavedTownListMatches(savedTowns, firstTown);
      savedTowns = await apiClient.listSavedTowns({ email: 'TEST_USER_2' });
      expectSavedTownListMatches(savedTowns, firstTown);
      await apiClient.deleteSavedTown({ email: 'TEST_USER', townID: firstTown.coveyTownID });
      savedTowns = await apiClient.listSavedTowns({ email: 'TEST_USER' });
      try {
        expectSavedTownListMatches(savedTowns, firstTown);
        fail('should not keep unsaved towns');
      } catch (err) {
        // OK- error expected
      }
      savedTowns = await apiClient.listSavedTowns({ email: 'TEST_USER_2' });
      expectSavedTownListMatches(savedTowns, firstTown);
    });
  });

  describe('CoveyTownListAPI', () => {
    it('Lists public towns, but not private towns', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      const privTown1 = await createTownForTesting(undefined, false);
      const pubTown2 = await createTownForTesting(undefined, true);
      const privTown2 = await createTownForTesting(undefined, false);

      const towns = await apiClient.listTowns();
      expectTownListMatches(towns, pubTown1);
      expectTownListMatches(towns, pubTown2);
      expectTownListMatches(towns, privTown1);
      expectTownListMatches(towns, privTown2);

    });
    it('Allows for multiple towns with the same friendlyName', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      const privTown1 = await createTownForTesting(pubTown1.friendlyName, false);
      const pubTown2 = await createTownForTesting(pubTown1.friendlyName, true);
      const privTown2 = await createTownForTesting(pubTown1.friendlyName, false);

      const towns = await apiClient.listTowns();
      expectTownListMatches(towns, pubTown1);
      expectTownListMatches(towns, pubTown2);
      expectTownListMatches(towns, privTown1);
      expectTownListMatches(towns, privTown2);
    });
  });

  describe('CoveyTownDeleteAPI', () => {
    it('Throws an error if the password is invalid', async () => {
      const { coveyTownID } = await createTownForTesting(undefined, true);
      try {
        await apiClient.deleteTown({
          coveyTownID,
          coveyTownPassword: nanoid(),
        });
        fail('Expected deleteTown to throw an error');
      } catch (e) {
        // Expected error
      }
    });
    it('Throws an error if the townID is invalid', async () => {
      const { townUpdatePassword } = await createTownForTesting(undefined, true);
      try {
        await apiClient.deleteTown({
          coveyTownID: nanoid(),
          coveyTownPassword: townUpdatePassword,
        });
        fail('Expected deleteTown to throw an error');
      } catch (e) {
        // Expected error
      }
    });
    it('Deletes a town if given a valid password and town, no longer allowing it to be joined or listed', async () => {
      const { coveyTownID, townUpdatePassword } = await createTownForTesting(undefined, true);
      await apiClient.deleteTown({
        coveyTownID,
        coveyTownPassword: townUpdatePassword,
      });
      try {
        await apiClient.joinTown({
          userName: nanoid(),
          coveyTownID,
        });
        fail('Expected joinTown to throw an error');
      } catch (e) {
        // Expected
      }
      const listedTowns = await apiClient.listTowns();
      if (listedTowns.towns.find(r => r.coveyTownID === coveyTownID)) {
        fail('Expected the deleted town to no longer be listed');
      }
    });
  });
  describe('CoveyTownUpdateAPI', () => {
    it('Checks the password before updating any values', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      try {
        await apiClient.updateTown({
          coveyTownID: pubTown1.coveyTownID,
          coveyTownPassword: `${pubTown1.townUpdatePassword}*`,
          friendlyName: 'broken',
          isPubliclyListed: false,
        });
        fail('updateTown with an invalid password should throw an error');
      } catch (err) {
        // err expected
        // TODO this should really check to make sure it's the *right* error, but we didn't specify
        // the format of the exception :(
      }

      // Make sure name or vis didn't change
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
    });
    it('Updates the friendlyName and visbility as requested', async () => {
      const pubTown1 = await createTownForTesting(undefined, false);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      await apiClient.updateTown({
        coveyTownID: pubTown1.coveyTownID,
        coveyTownPassword: pubTown1.townUpdatePassword,
        friendlyName: 'newName',
        isPubliclyListed: true,
      });
      pubTown1.friendlyName = 'newName';
      pubTown1.isPubliclyListed = true;
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
    });
    it('Does not update the visibility if visibility is undefined', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
      await apiClient.updateTown({
        coveyTownID: pubTown1.coveyTownID,
        coveyTownPassword: pubTown1.townUpdatePassword,
        friendlyName: 'newName2',
      });
      pubTown1.friendlyName = 'newName2';
      expectTownListMatches(await apiClient.listTowns(), pubTown1);
    });
  });

  describe('CoveyMemberAPI', () => {
    it('Throws an error if the town does not exist', async () => {
      await createTownForTesting(undefined, true);
      try {
        await apiClient.joinTown({
          userName: nanoid(),
          coveyTownID: nanoid(),
        });
        fail('Expected an error to be thrown by joinTown but none thrown');
      } catch (err) {
        // OK, expected an error
        // TODO this should really check to make sure it's the *right* error, but we didn't specify
        // the format of the exception :(
      }
    });
    it('Admits a user to a valid public or private town', async () => {
      const pubTown1 = await createTownForTesting(undefined, true);
      const privTown1 = await createTownForTesting(undefined, false);
      const res = await apiClient.joinTown({
        userName: nanoid(),
        coveyTownID: pubTown1.coveyTownID,
      });
      expect(res.coveySessionToken)
        .toBeDefined();
      expect(res.coveyUserID)
        .toBeDefined();

      const res2 = await apiClient.joinTown({
        userName: nanoid(),
        coveyTownID: privTown1.coveyTownID,
      });
      expect(res2.coveySessionToken)
        .toBeDefined();
      expect(res2.coveyUserID)
        .toBeDefined();

    });
  });
});
