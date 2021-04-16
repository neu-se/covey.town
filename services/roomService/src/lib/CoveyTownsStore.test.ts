import { nanoid } from 'nanoid';
import { CoveyTownsStore, CreateTownResponse, updateTown } from './CoveyTownsStore';
import CoveyTownListener from '../types/CoveyTownListener';
import Player from '../types/Player';
import db from '../database/knexfile';
import { logUser, deleteUser, saveTown, unsaveTown } from '../database/databaseService';

const mockCoveyListenerTownDestroyed = jest.fn();
const mockCoveyListenerOtherFns = jest.fn();

type Name = {
  friendlyName: string,
};

type PublicStatus = {
  isPublicallyListed: boolean,
};

function mockCoveyListener(): CoveyTownListener {
  return {
    onPlayerDisconnected(removedPlayer: Player): void {
      mockCoveyListenerOtherFns(removedPlayer);
    },
    onPlayerMoved(movedPlayer: Player): void {
      mockCoveyListenerOtherFns(movedPlayer);
    },
    onTownDestroyed() {
      mockCoveyListenerTownDestroyed();
    },
    onPlayerJoined(newPlayer: Player) {
      mockCoveyListenerOtherFns(newPlayer);
    },
  };
}

async function createTownForTesting(friendlyNameToUse?: string, isPublic = false, creator = 'TEST_USER'): Promise<CreateTownResponse> {
  const friendlyName = friendlyNameToUse !== undefined ? friendlyNameToUse :
    `${isPublic ? 'Public' : 'Private'}TestingTown=${nanoid()}`;
  return CoveyTownsStore.getInstance().then((instance: CoveyTownsStore) =>
    instance.createTown(friendlyName, isPublic, creator));
}

describe('CoveyTownsStore', () => {

  beforeEach(async () => {
    await logUser('TEST_USER');
    await logUser('TEST_USER_2');
    mockCoveyListenerTownDestroyed.mockClear();
    mockCoveyListenerOtherFns.mockClear();
  });
  it('should be a singleton', async () => {
    const store1 = await CoveyTownsStore.getInstance();
    const store2 = await CoveyTownsStore.getInstance();
    expect(store1)
      .toBe(store2);
  });
  afterEach(async () => {
    await deleteUser('TEST_USER');
    await deleteUser('TEST_USER_2');
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('createTown', () => {
    it('Should allow multiple towns with the same friendlyName', async () => {
      const firstTown = await createTownForTesting();
      const firstFriendlyName = await db('Towns')
        .select('friendlyName')
        .where('coveyTownID', firstTown.coveyTownController.coveyTownID)
        .then((response: Name[]) => {
          const town = response[0];
          const name: string = town.friendlyName;
          return name;
        });
      const secondTown = await createTownForTesting(firstFriendlyName);
      const secondFriendlyName = await db('Towns')
        .select('friendlyName')
        .where('coveyTownID', secondTown.coveyTownController.coveyTownID)
        .then((response: Name[]) => {
          const town = response[0];
          const name: string = town.friendlyName;
          return name;
        });
      expect(firstTown)
        .not
        .toBe(secondTown);
      expect(firstFriendlyName)
        .toBe(secondFriendlyName);
      expect(firstTown.coveyTownController.coveyTownID)
        .not
        .toBe(secondTown.coveyTownController.coveyTownID);
    });
  });

  describe('getControllerForTown', () => {
    it('Should return the same controller on repeated calls', async () => {
      const firstTown = await createTownForTesting();
      const firstController = firstTown.coveyTownController;
      expect(firstController)
        .toBe(await CoveyTownsStore.getInstance()
          .then(instance =>
            instance.getControllerForTown(firstController.coveyTownID)));
      expect(firstController)
        .toBe(await CoveyTownsStore.getInstance()
          .then(instance => 
            instance.getControllerForTown(firstController.coveyTownID)));
    });
  });

  describe('updateTown', () => {
    it('Should check the password before updating any value', async () => {
      const town = await createTownForTesting();
      const friendlyName = await db('Towns')
        .select('friendlyName')
        .where('coveyTownID', town.coveyTownController.coveyTownID)
        .then((response: Name[]) => {
          const currentTown = response[0];
          const name: string = currentTown.friendlyName;
          return name;
        });
      const res = await updateTown(town.coveyTownController.coveyTownID, 'abcd', 'newName', true);
      expect(res)
        .toBe(false);
      const currentFriendlyName = await db('Towns')
        .select('friendlyName')
        .where('coveyTownID', town.coveyTownController.coveyTownID)
        .then((response: Name[]) => {
          const currentTown = response[0];
          const name: string = currentTown.friendlyName;
          return name;
        });
      expect(currentFriendlyName)
        .toBe(friendlyName);
      const currentPublicStatus = await db('Towns')
        .select('isPublicallyListed')
        .where('coveyTownID', town.coveyTownController.coveyTownID)
        .then((response: PublicStatus[]) => {
          const currentTown = response[0];
          const publicStatus: boolean = currentTown.isPublicallyListed;
          return publicStatus;
        });
      expect(currentPublicStatus)
        .toBe(false);

    });
    it('Should fail if the townID does not exist', async () => {
      const town = await createTownForTesting();
      const friendlyName = await db('Towns')
        .select('friendlyName')
        .where('coveyTownID', town.coveyTownController.coveyTownID)
        .then((response: Name[]) => {
          const currentTown = response[0];
          const name: string = currentTown.friendlyName;
          return name;
        });
      const res = await updateTown('abcdef', town.coveyTownPassword, 'newName', true);

      expect(res)
        .toBe(false);
      const currentFriendlyName = await db('Towns')
        .select('friendlyName')
        .where('coveyTownID', town.coveyTownController.coveyTownID)
        .then((response: Name[]) => {
          const currentTown = response[0];
          const name: string = currentTown.friendlyName;
          return name;
        });
      expect(currentFriendlyName)
        .toBe(friendlyName);
      const currentPublicStatus = await db('Towns')
        .select('isPublicallyListed')
        .where('coveyTownID', town.coveyTownController.coveyTownID)
        .then((response: PublicStatus[]) => {
          const currentTown = response[0];
          const publicStatus: boolean = currentTown.isPublicallyListed;
          return publicStatus;
        });
      expect(currentPublicStatus)
        .toBe(false);
    });

    it('Should update the town parameters', async () => {

      // First try with just a visiblity change
      const town = await createTownForTesting();
      const friendlyName = await db('Towns')
        .select('friendlyName')
        .where('coveyTownID', town.coveyTownController.coveyTownID)
        .then((response: Name[]) => {
          const currentTown = response[0];
          const name: string = currentTown.friendlyName;
          return name;
        });
      const res = await updateTown(town.coveyTownController.coveyTownID, town.coveyTownPassword, undefined, true);
      expect(res)
        .toBe(true);
      let currentFriendlyName = await db('Towns')
        .select('friendlyName')
        .where('coveyTownID', town.coveyTownController.coveyTownID)
        .then((response: Name[]) => {
          const currentTown = response[0];
          const name: string = currentTown.friendlyName;
          return name;
        });
      expect(currentFriendlyName)
        .toBe(friendlyName);
      let currentPublicStatus = await db('Towns')
        .select('isPublicallyListed')
        .where('coveyTownID', town.coveyTownController.coveyTownID)
        .then((response: PublicStatus[]) => {
          const currentTown = response[0];
          const publicStatus: boolean = currentTown.isPublicallyListed;
          return publicStatus;
        });
      expect(currentPublicStatus)
        .toBe(true);

      // Now try with just a name change
      const newFriendlyName = nanoid();
      const res2 = await updateTown(town.coveyTownController.coveyTownID, town.coveyTownPassword, newFriendlyName, undefined);
      expect(res2)
        .toBe(true);
      currentFriendlyName = await db('Towns')
        .select('friendlyName')
        .where('coveyTownID', town.coveyTownController.coveyTownID)
        .then((response: Name[]) => {
          const currentTown = response[0];
          const name: string = currentTown.friendlyName;
          return name;
        });
      expect(currentFriendlyName)
        .toBe(newFriendlyName);
      currentPublicStatus = await db('Towns')
        .select('isPublicallyListed')
        .where('coveyTownID', town.coveyTownController.coveyTownID)
        .then((response: PublicStatus[]) => {
          const currentTown = response[0];
          const publicStatus: boolean = currentTown.isPublicallyListed;
          return publicStatus;
        });
      expect(currentPublicStatus)
        .toBe(true);

      // Now try to change both
      const res3 = await updateTown(town.coveyTownController.coveyTownID, town.coveyTownPassword, friendlyName, false);
      expect(res3)
        .toBe(true);

      currentFriendlyName = await db('Towns')
        .select('friendlyName')
        .where('coveyTownID', town.coveyTownController.coveyTownID)
        .then((response: Name[]) => {
          const currentTown = response[0];
          const name: string = currentTown.friendlyName;
          return name;
        });
      expect(currentFriendlyName)
        .toBe(friendlyName);
      currentPublicStatus = await db('Towns')
        .select('isPublicallyListed')
        .where('coveyTownID', town.coveyTownController.coveyTownID)
        .then((response: PublicStatus[]) => {
          const currentTown = response[0];
          const publicStatus: boolean = currentTown.isPublicallyListed;
          return publicStatus;
        });
      expect(currentPublicStatus)
        .toBe(false);
    });
  });

  describe('deleteTown', () => {
    it('Should check the password before deleting the town', async () => {
      const town = await createTownForTesting();
      const res = await CoveyTownsStore.getInstance().then(instance => 
        instance.deleteTown(town.coveyTownController.coveyTownID, `${town.coveyTownPassword}*`));
      expect(res)
        .toBe(false);
    });
    it('Should fail if the townID does not exist', async () => {
      const res = await CoveyTownsStore.getInstance().then(instance =>
        instance.deleteTown('abcdef', 'efg'));
      expect(res)
        .toBe(false);
    });
    it('Should disconnect all players', async () => {
      const town = await createTownForTesting();
      town.coveyTownController.addTownListener(mockCoveyListener());
      town.coveyTownController.addTownListener(mockCoveyListener());
      town.coveyTownController.addTownListener(mockCoveyListener());
      town.coveyTownController.addTownListener(mockCoveyListener());
      town.coveyTownController.disconnectAllPlayers();

      expect(mockCoveyListenerOtherFns.mock.calls.length)
        .toBe(0);
      expect(mockCoveyListenerTownDestroyed.mock.calls.length)
        .toBe(4);
    });
  });

  describe('listTowns', () => {
    it('Should include public towns', async () => {
      const town = await createTownForTesting(undefined, true);
      const towns = await CoveyTownsStore.getInstance().then(instance => 
        instance.getTowns());
      const entry = towns.filter(townInfo => townInfo.coveyTownID === town.coveyTownController.coveyTownID);
      expect(entry.length)
        .toBe(1);
      const currentFriendlyName = await db('Towns')
        .select('friendlyName')
        .where('coveyTownID', town.coveyTownController.coveyTownID)
        .then((response: Name[]) => {
          const currentTown = response[0];
          const name: string = currentTown.friendlyName;
          return name;
        });
      expect(entry[0].friendlyName)
        .toBe(currentFriendlyName);
      expect(entry[0].coveyTownID)
        .toBe(town.coveyTownController.coveyTownID);
    });
    it('Should include each CoveyTownID if there are multiple towns with the same friendlyName', async () => {
      const town = await createTownForTesting(undefined, true);
      const townName = await db('Towns')
        .select('friendlyName')
        .where('coveyTownID', town.coveyTownController.coveyTownID)
        .then((response: Name[]) => {
          const currentTown = response[0];
          const name: string = currentTown.friendlyName;
          return name;
        });
      const secondTown = await createTownForTesting(townName, true);
      const towns = await CoveyTownsStore.getInstance().then(instance => 
        instance.getTowns().then(publicTowns => 
          publicTowns.filter(townInfo => townInfo.friendlyName === townName)));
      expect(towns.length)
        .toBe(2);
      expect(towns[0].friendlyName)
        .toBe(townName);
      expect(towns[1].friendlyName)
        .toBe(townName);

      if (towns[0].coveyTownID === town.coveyTownController.coveyTownID) {
        expect(towns[1].coveyTownID)
          .toBe(secondTown.coveyTownController.coveyTownID);
      } else if (towns[1].coveyTownID === town.coveyTownController.coveyTownID) {
        expect(towns[0].coveyTownID)
          .toBe(secondTown.coveyTownController.coveyTownID);
      } else {
        fail('Expected the coveyTownIDs to match the towns that were created');
      }

    });
    it('Should not include private towns', async () => {
      const town = await createTownForTesting(undefined, false);
      const townName = await db('Towns')
        .select('friendlyName')
        .where('coveyTownID', town.coveyTownController.coveyTownID)
        .then((response: Name[]) => {
          const currentTown = response[0];
          const name: string = currentTown.friendlyName;
          return name;
        });
      const towns = await CoveyTownsStore.getInstance().then(instance => 
        instance.getTowns().then(publicTowns => 
          publicTowns.filter(townInfo => townInfo.friendlyName === townName || townInfo.coveyTownID === town.coveyTownController.coveyTownID)));
        
      expect(towns.length)
        .toBe(0);
    });
    it('Should not include private towns, even if there is a public town of same name', async () => {
      const town = await createTownForTesting(undefined, false);
      const townName = await db('Towns')
        .select('friendlyName')
        .where('coveyTownID', town.coveyTownController.coveyTownID)
        .then((response: Name[]) => {
          const currentTown = response[0];
          const name: string = currentTown.friendlyName;
          return name;
        });
      const town2 = await createTownForTesting(townName, true);
      const town2Name = await db('Towns')
        .select('friendlyName')
        .where('coveyTownID', town2.coveyTownController.coveyTownID)
        .then((response: Name[]) => {
          const currentTown = response[0];
          const name: string = currentTown.friendlyName;
          return name;
        });
      const towns = await CoveyTownsStore.getInstance().then(instance => 
        instance.getTowns().then(publicTowns => 
          publicTowns.filter(townInfo => townInfo.friendlyName === townName || townInfo.coveyTownID === town.coveyTownController.coveyTownID)));
        
      expect(towns.length)
        .toBe(1);
      expect(towns[0].coveyTownID)
        .toBe(town2.coveyTownController.coveyTownID);
      expect(towns[0].friendlyName)
        .toBe(town2Name);
    });
    it('Should not include deleted towns', async () => {
      const town = await createTownForTesting(undefined, true);
      const townName = await db('Towns')
        .select('friendlyName')
        .where('coveyTownID', town.coveyTownController.coveyTownID)
        .then((response: Name[]) => {
          const currentTown = response[0];
          const name: string = currentTown.friendlyName;
          return name;
        });
      const towns = await CoveyTownsStore.getInstance().then(instance => 
        instance.getTowns().then(publicTowns => 
          publicTowns.filter(townInfo => townInfo.friendlyName === townName || townInfo.coveyTownID === town.coveyTownController.coveyTownID)));
      expect(towns.length)
        .toBe(1);
      const res = await CoveyTownsStore.getInstance().then(instance => 
        instance.deleteTown(town.coveyTownController.coveyTownID, town.coveyTownPassword));
      expect(res)
        .toBe(true);
      const townsPostDelete = await CoveyTownsStore.getInstance().then(instance => 
        instance.getTowns().then(publicTowns => 
          publicTowns.filter(townInfo => townInfo.friendlyName === townName || townInfo.coveyTownID === town.coveyTownController.coveyTownID)));
      expect(townsPostDelete.length)
        .toBe(0);
    });
  });
  describe('listSavedTowns', () => {
    it('should list saved towns for given user', async () => {
      const town = await createTownForTesting();
      await saveTown('TEST_USER', town.coveyTownController.coveyTownID);
      const towns = await CoveyTownsStore.getInstance().then(instance =>
        instance.getSavedTowns('TEST_USER'));
      expect(towns.length)
        .toBe(1);
      expect(towns[0].coveyTownID)
        .toBe((await town).coveyTownController.coveyTownID);
    });
    it('should not list towns saved if given invalid user', async () => {
      const town = await createTownForTesting();
      await saveTown('TEST_USER', town.coveyTownController.coveyTownID);
      const towns = await CoveyTownsStore.getInstance().then(instance =>
        instance.getSavedTowns('INVALID_USER'));
      expect(towns.length)
        .toBe(0);
    });
    it('should not list towns for other valid user', async () => {
      const townA = await createTownForTesting();
      await saveTown('TEST_USER', townA.coveyTownController.coveyTownID);
      const townB = await createTownForTesting('TEST_USER_2');
      await saveTown('TEST_USER_2', townB.coveyTownController.coveyTownID);
      const townsA = await CoveyTownsStore.getInstance().then(instance =>
        instance.getSavedTowns('TEST_USER'));
      expect(townsA.length)
        .toBe(1);
      expect(townsA[0].coveyTownID)
        .toBe(townA.coveyTownController.coveyTownID);
      const townsB = await CoveyTownsStore.getInstance().then(instance =>
        instance.getSavedTowns('TEST_USER_2'));
      expect(townsB.length)
        .toBe(1);
      expect(townsB[0].coveyTownID)
        .toBe(townB.coveyTownController.coveyTownID);
    });
    it('should not list towns that were created by the user, but not saved', async () => {
      await createTownForTesting();
      const townsA = await CoveyTownsStore.getInstance().then(instance =>
        instance.getSavedTowns('TEST_USER'));
      expect(townsA.length)
        .toBe(0);
    });
    it('should list towns created by one user, but saved by another', async () => {
      const town = await createTownForTesting('TEST_USER_2');
      await saveTown('TEST_USER', town.coveyTownController.coveyTownID);
      const towns = await CoveyTownsStore.getInstance().then(instance =>
        instance.getSavedTowns('TEST_USER'));
      expect(towns.length)
        .toBe(1);
      expect(towns[0].coveyTownID)
        .toBe(town.coveyTownController.coveyTownID);
    });
    it('should not include deleted towns', async () => {
      const town = await createTownForTesting();
      await saveTown('TEST_USER', town.coveyTownController.coveyTownID);
      await CoveyTownsStore.getInstance().then(instance =>
        instance.deleteTown(town.coveyTownController.coveyTownID, town.coveyTownPassword));
      const towns = await CoveyTownsStore.getInstance().then(instance =>
        instance.getSavedTowns('TEST_USER'));
      expect(towns.length)
        .toBe(0);
    });
    it('should not include unsaved towns', async () => {
      const town = await createTownForTesting();
      await saveTown('TEST_USER', town.coveyTownController.coveyTownID);
      await unsaveTown('TEST_USER', town.coveyTownController.coveyTownID);
      const towns = await CoveyTownsStore.getInstance().then(instance =>
        instance.getSavedTowns('TEST_USER'));
      expect(towns.length)
        .toBe(0);
    });
  });
});

