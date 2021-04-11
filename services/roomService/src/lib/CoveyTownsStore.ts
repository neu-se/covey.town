import CoveyTownController from './CoveyTownController';
import { CoveyTownList } from '../CoveyTypes';
import {
  TownData,
  allTownResponse,
  getPublicTowns,
  getAllTowns,
  addNewTown,
  updateTownName,
  updateTownPublicStatus,
  deleteTown,
  getTownByID,
  townListingInfo
} from '../database/databaseService';
import { F } from 'ramda';
import { customAlphabet, nanoid } from 'nanoid';


export type CreateTownResponse = {
  coveyTownController: CoveyTownController,
  coveyTownPassword: string,
}
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

  static getInstance(): CoveyTownsStore {
    if (CoveyTownsStore._instance === undefined) {
      CoveyTownsStore._instance = new CoveyTownsStore();
      
      // populate with existing towns from DB
      const allTowns = getAllTowns();
      for (let town in allTowns) {
        const newController = new CoveyTownController(town);
        CoveyTownsStore._instance._towns.push(newController);
      }

    }
    return CoveyTownsStore._instance;
  }

  getControllerForTown(coveyTownID: string): CoveyTownController | undefined {
    return this._towns.find(town => town.coveyTownID === coveyTownID);
  }

  async getTowns(): Promise<CoveyTownList> {
    const publicTowns: townListingInfo[] = await getPublicTowns();
    let response: CoveyTownList = [];
    for (let town of publicTowns) {
      const coveyTownID = town.coveyTownID;
      const controller = this.getControllerForTown(coveyTownID);
      if (controller) {
        const capacity = controller?.capacity;
        const occupancy = controller?.occupancy;

        response.push({
          friendlyName: town.friendlyName,
          coveyTownID: coveyTownID,
          currentOccupancy: occupancy,
          maximumOccupancy: capacity,
        })
      }
    }
    return response;
  }

  async createTown(friendlyName: string, isPubliclyListed: boolean, userEmail: string): Promise<CreateTownResponse> {
    const custom = customAlphabet('1234567890ABCDEF', 8).toString();
    // tried to use the custom alphabet thing but it was being weird :(
    const townID = nanoid(30); 
    const password = nanoid(24);

    const newTown = new CoveyTownController(townID);
    this._towns.push(newTown); 
    await addNewTown(townID, password, friendlyName, isPubliclyListed, userEmail);
    console.log('newTown Created');

    return {coveyTownController: newTown, coveyTownPassword: password};
  }

  async updateTown(coveyTownID: string, coveyTownPassword: string, friendlyName?: string, makePublic?: boolean): Promise<boolean> {
    const existingTown = await getTownByID(coveyTownID); 
    if (existingTown && passwordMatches(coveyTownPassword, existingTown.coveyTownPassword)) {
      if (friendlyName !== undefined) {
        if (friendlyName.length === 0) {
          return false;
        }
        await updateTownName(coveyTownID, coveyTownPassword, friendlyName);
      }
      if (makePublic !== undefined) {
        await updateTownPublicStatus(coveyTownID, coveyTownPassword, makePublic);
      }
      return true;
    }
    return false;
  }

  async deleteTown(coveyTownID: string, coveyTownPassword: string): Promise<boolean> {
    const existingTown = await getTownByID(coveyTownID);
    const controller = this.getControllerForTown(coveyTownID);
    if (controller) {
      if (existingTown && passwordMatches(coveyTownPassword, existingTown.coveyTownPassword)) {
        this._towns = this._towns.filter(town => town !== controller);
        controller.disconnectAllPlayers();
        await deleteTown(coveyTownID, coveyTownPassword);
        return true;
      }
    }
    return false;
  }

}
