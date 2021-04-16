import { nanoid } from 'nanoid';
import { CoveyTown } from '../CoveyTypes';
import MongoAtlasClient from './MongoAtlasClient';

describe('MongoAtlasClient', () => {
  it('should be a singleton', async () => {
    const client1 = await MongoAtlasClient.setup();
    const client2 = await MongoAtlasClient.setup();
    expect(client1).toBe(client2);
  });

  describe('saveTown', () => {
    it('should save the given town', async () => {
      const mockSaveTown = jest.fn();
      const client1 = await MongoAtlasClient.setup();
      client1.saveTown = mockSaveTown;

      const dummyTown1: CoveyTown = {
        coveyTownID: nanoid(),
        friendlyName: 'dummyTown1',
        players: [],
        townUpdatePassword: 'test',
        capacity: 10,
        occupancy: 10,
        isPubliclyListed: true,
      };

      await client1.saveTown(dummyTown1);
      expect(mockSaveTown).toHaveBeenCalledWith(dummyTown1);
    });
  });

  describe('deleteTown', () => {
    it('should call delete town using the given town ID', async () => {
      const mockDeleteTown = jest.fn();
      const client1 = await MongoAtlasClient.setup();
      client1.deleteTown = mockDeleteTown;

      const dummyID = nanoid();

      await client1.deleteTown(dummyID);
      expect(mockDeleteTown).toHaveBeenCalledWith(dummyID);
    });
  });

  describe('getTowns', () => {
    it('should get a list of towns', async () => {
      const dummyTown1: CoveyTown = {
        coveyTownID: nanoid(),
        friendlyName: 'dummyTown1',
        players: [],
        townUpdatePassword: 'test',
        capacity: 10,
        occupancy: 10,
        isPubliclyListed: true,
      };
      const mockTownsPromise = jest.fn((): Promise<CoveyTown[]> => Promise.resolve([dummyTown1]));
      const client1 = await MongoAtlasClient.setup();
      client1.getTowns = mockTownsPromise;

      expect(await client1.getTowns()).toStrictEqual([dummyTown1]);
    });
  });
},
);