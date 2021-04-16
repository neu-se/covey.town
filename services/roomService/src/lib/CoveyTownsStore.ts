import CoveyTownController from './CoveyTownController';
import { CoveyTown, CoveyTownList } from '../CoveyTypes';
import MongoAtlasClient from '../services/MongoAtlasClient';
import IDBClient from '../services/IDBClient';

function passwordMatches(provided: string, expected: string): boolean {
  if (provided === expected) {
    return true;
  }
  if (process.env.MASTER_TOWN_PASSWORD && process.env.MASTER_TOWN_PASWORD === provided) {
    return true;
  }
  return false;
}

export default class CoveyTownsStore {
  private static _instance: CoveyTownsStore;

  private _towns: CoveyTownController[] = [];

  private _dbClient: Promise<IDBClient>;

  private constructor() {
    this._dbClient = MongoAtlasClient.setup();
  }


  static async getInstance(pdbClient?: Promise<IDBClient>): Promise<CoveyTownsStore> {
    if (CoveyTownsStore._instance === undefined) {
      CoveyTownsStore._instance = new CoveyTownsStore();
      try {
        const dbClient = await pdbClient ?? await CoveyTownsStore._instance._dbClient;
        const dbTowns = await dbClient.getTowns();
        dbTowns.forEach(async town => {
          dbClient.deleteTown(town.coveyTownID);
          await CoveyTownsStore._instance.createTown(town.friendlyName, town.isPubliclyListed);
        });
      } catch (err) {
        throw new Error(`Failed to Initialize Towns from DB: ${err.toString()}`);
      }
    }
    return CoveyTownsStore._instance;
  }

  getControllerForTown(coveyTownID: string): CoveyTownController | undefined {
    return this._towns.find(town => town.coveyTownID === coveyTownID);
  }

  getTowns(): CoveyTownList {
    return this._towns.filter(townController => townController.isPubliclyListed)
      .map(townController => ({
        coveyTownID: townController.coveyTownID,
        friendlyName: townController.friendlyName,
        currentOccupancy: townController.occupancy,
        maximumOccupancy: townController.capacity,
      }));
  }

  async createTown(friendlyName: string, isPubliclyListed: boolean): Promise<CoveyTownController> {
    const newTown = new CoveyTownController(friendlyName, isPubliclyListed);
    this._towns.push(newTown);
    try {
      const dbClient = await this._dbClient;
      await dbClient.saveTown(newTown.toCoveyTown());
    } catch (err) {
      throw new Error(`Error creating town and saving to DB: ${err.toString()}`);
    }
    return newTown;
  }

  async updateTown(coveyTownID: string, coveyTownPassword: string, friendlyName?: string, makePublic?: boolean): Promise<boolean> {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown && passwordMatches(coveyTownPassword, existingTown.townUpdatePassword)) {
      if (friendlyName !== undefined) {
        if (friendlyName.length === 0) {
          return false;
        }
        existingTown.friendlyName = friendlyName;
      }
      if (makePublic !== undefined) {
        existingTown.isPubliclyListed = makePublic;
      }
      try {
        const dbClient = await this._dbClient;
        await dbClient.saveTown(existingTown.toCoveyTown());
      } catch (err) {
        throw new Error(`Error updating town to DB: ${err.toString()}`);
      }
      return true;
    }
    return false;
  }

  async deleteTown(coveyTownID: string, coveyTownPassword: string): Promise<boolean> {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown && passwordMatches(coveyTownPassword, existingTown.townUpdatePassword)) {
      this._towns = this._towns.filter(town => town !== existingTown);
      existingTown.disconnectAllPlayers();
      try {
        const dbClient = await this._dbClient;
        await dbClient.deleteTown(coveyTownID);
      } catch (err) {
        throw new Error(`Error deleting town from DB: ${err.toString()}`);
      }

      return true;
    }
    return false;
  }

}
