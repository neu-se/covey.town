import { nanoid } from 'nanoid';
import CoveyTownsStore from './CoveyTownsStore';
import CoveyTownListener from '../types/CoveyTownListener';
import Player from '../types/Player';

const mockCoveyListenerTownDestroyed = jest.fn();
const mockCoveyListenerOtherFns = jest.fn();

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

async function createTownForTesting(friendlyNameToUse?: string, isPublic = false) {
  const friendlyName = friendlyNameToUse !== undefined ? friendlyNameToUse :
    `${isPublic ? 'Public' : 'Private'}TestingTown=${nanoid()}`;
  return (await CoveyTownsStore.getInstance())
    .createTown(friendlyName, isPublic);
}

describe('CoveyTownsStore', () => {
  beforeEach(() => {
    mockCoveyListenerTownDestroyed.mockClear();
    mockCoveyListenerOtherFns.mockClear();
  });
  it('should be a singleton', () => {
    const store1 = CoveyTownsStore.getInstance();
    const store2 = CoveyTownsStore.getInstance();
    expect(store1)
      .toBe(store2);
  });

  describe('createTown', () => {
    it('Should allow multiple towns with the same friendlyName', async () => {
      const firstTown = await createTownForTesting();
      const secondTown = await createTownForTesting(firstTown.friendlyName);
      expect(firstTown)
        .not
        .toBe(secondTown);
      expect(firstTown.friendlyName)
        .toBe(secondTown.friendlyName);
      expect(firstTown.coveyTownID)
        .not
        .toBe(secondTown.coveyTownID);
    });
  });

  describe('getControllerForTown', () => {
    it('Should return the same controller on repeated calls', async () => {
      const firstTown = await createTownForTesting();
      expect(firstTown)
        .toBe((await CoveyTownsStore.getInstance())
          .getControllerForTown(firstTown.coveyTownID));
      expect(firstTown)
        .toBe((await CoveyTownsStore.getInstance())
          .getControllerForTown(firstTown.coveyTownID));
    });
  });

  describe('updateTown', () => {
    it('Should check the password before updating any value', async () => {
      const town = await createTownForTesting();
      const { friendlyName } = town;
      const res = (await CoveyTownsStore.getInstance())
        .updateTown(town.coveyTownID, 'abcd', 'newName', true);
      expect(res)
        .toBe(false);
      expect(town.friendlyName)
        .toBe(friendlyName);
      expect(town.isPubliclyListed)
        .toBe(false);

    });
    it('Should fail if the townID does not exist', async () => {
      const town = await createTownForTesting();
      const { friendlyName } = town;

      const res = (await CoveyTownsStore.getInstance())
        .updateTown('abcdef', town.townUpdatePassword, 'newName', true);
      expect(res)
        .toBe(false);
      expect(town.friendlyName)
        .toBe(friendlyName);
      expect(town.isPubliclyListed)
        .toBe(false);

    });
    it('Should update the town parameters', async () => {

      // First try with just a visiblity change
      const town = await createTownForTesting();
      const { friendlyName } = town;
      const res = (await CoveyTownsStore.getInstance())
        .updateTown(town.coveyTownID, town.townUpdatePassword, undefined, true);
      expect(res)
        .toBe(true);
      expect(town.isPubliclyListed)
        .toBe(true);
      expect(town.friendlyName)
        .toBe(friendlyName);

      // Now try with just a name change
      const newFriendlyName = nanoid();
      const res2 = (await CoveyTownsStore.getInstance())
        .updateTown(town.coveyTownID, town.townUpdatePassword, newFriendlyName, undefined);
      expect(res2)
        .toBe(true);
      expect(town.isPubliclyListed)
        .toBe(true);
      expect(town.friendlyName)
        .toBe(newFriendlyName);

      // Now try to change both
      const res3 = (await CoveyTownsStore.getInstance())
        .updateTown(town.coveyTownID, town.townUpdatePassword, friendlyName, false);
      expect(res3)
        .toBe(true);
      expect(town.isPubliclyListed)
        .toBe(false);
      expect(town.friendlyName)
        .toBe(friendlyName);
    });
  });

  describe('deleteTown', () => {
    it('Should check the password before deleting the town', async () => {
      const town = await createTownForTesting();
      const res = (await CoveyTownsStore.getInstance())
        .deleteTown(town.coveyTownID, `${town.townUpdatePassword}*`);
      expect(res)
        .toBe(false);
    });
    it('Should fail if the townID does not exist', async () => {
      const res = (await CoveyTownsStore.getInstance())
        .deleteTown('abcdef', 'efg');
      expect(res)
        .toBe(false);
    });
    it('Should disconnect all players', async () => {
      const town = await createTownForTesting();
      town.addTownListener(mockCoveyListener());
      town.addTownListener(mockCoveyListener());
      town.addTownListener(mockCoveyListener());
      town.addTownListener(mockCoveyListener());
      town.disconnectAllPlayers();

      expect(mockCoveyListenerOtherFns.mock.calls.length)
        .toBe(0);
      expect(mockCoveyListenerTownDestroyed.mock.calls.length)
        .toBe(4);
    });
  });

  describe('listTowns', () => {
    it('Should include public towns', async () => {
      const town = await createTownForTesting(undefined, true);
      const towns = (await CoveyTownsStore.getInstance())
        .getTowns();
      const entry = towns.filter(townInfo => townInfo.coveyTownID === town.coveyTownID);
      expect(entry.length)
        .toBe(1);
      expect(entry[0].friendlyName)
        .toBe(town.friendlyName);
      expect(entry[0].coveyTownID)
        .toBe(town.coveyTownID);
    });
    it('Should include each CoveyTownID if there are multiple towns with the same friendlyName', async () => {
      const town = await createTownForTesting(undefined, true);
      const secondTown = await createTownForTesting(town.friendlyName, true);
      const towns = (await CoveyTownsStore.getInstance())
        .getTowns()
        .filter(townInfo => townInfo.friendlyName === town.friendlyName);
      expect(towns.length)
        .toBe(2);
      expect(towns[0].friendlyName)
        .toBe(town.friendlyName);
      expect(towns[1].friendlyName)
        .toBe(town.friendlyName);

      if (towns[0].coveyTownID === town.coveyTownID) {
        expect(towns[1].coveyTownID)
          .toBe(secondTown.coveyTownID);
      } else if (towns[1].coveyTownID === town.coveyTownID) {
        expect(towns[0].coveyTownID)
          .toBe(town.coveyTownID);
      } else {
        fail('Expected the coveyTownIDs to match the towns that were created');
      }

    });
    it('Should not include private towns', async () => {
      const town = await createTownForTesting(undefined, false);
      const towns = (await CoveyTownsStore.getInstance())
        .getTowns()
        .filter(townInfo => townInfo.friendlyName === town.friendlyName || townInfo.coveyTownID === town.coveyTownID);
      expect(towns.length)
        .toBe(0);
    });
    it('Should not include private towns, even if there is a public town of same name', async () => {
      const town = await createTownForTesting(undefined, false);
      const town2 = await createTownForTesting(town.friendlyName, true);
      const towns = (await CoveyTownsStore.getInstance())
        .getTowns()
        .filter(townInfo => townInfo.friendlyName === town.friendlyName || townInfo.coveyTownID === town.coveyTownID);
      expect(towns.length)
        .toBe(1);
      expect(towns[0].coveyTownID)
        .toBe(town2.coveyTownID);
      expect(towns[0].friendlyName)
        .toBe(town2.friendlyName);
    });
    it('Should not include deleted towns', async () => {
      const town = await createTownForTesting(undefined, true);
      const towns = (await CoveyTownsStore.getInstance())
        .getTowns()
        .filter(townInfo => townInfo.friendlyName === town.friendlyName || townInfo.coveyTownID === town.coveyTownID);
      expect(towns.length)
        .toBe(1);
      const res = (await CoveyTownsStore.getInstance())
        .deleteTown(town.coveyTownID, town.townUpdatePassword);
      expect(res)
        .toBe(true);
      const townsPostDelete = (await CoveyTownsStore.getInstance())
        .getTowns()
        .filter(townInfo => townInfo.friendlyName === town.friendlyName || townInfo.coveyTownID === town.coveyTownID);
      expect(townsPostDelete.length)
        .toBe(0);
    });
  });
});

