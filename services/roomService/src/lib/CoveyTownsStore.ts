import { nanoid } from 'nanoid';
import CoveyTownController from './CoveyTownController';
import { CoveyTownList } from '../CoveyTypes';
import {
  AllTownResponse,
  SavedTownListingInfo,
  getPublicTowns,
  getSavedTowns,
  getAllTowns,
  addNewTown,
  updateTownName,
  updateTownPublicStatus,
  deleteTown,
  getTownByID,
  TownListingInfo,
} from '../database/databaseService';

export type SavedCoveyTownList = {
  friendlyName: string,
  coveyTownID: string,
  publicStatus: string,
  currentOccupancy: number,
  maximumOccupancy: number,
}[];

export type CreateTownResponse = {
  coveyTownController: CoveyTownController,
  coveyTownPassword: string,
};

function passwordMatches(provided: string, expected: string): boolean {
  if (provided === expected) {
    return true;
  }
  if (process.env.MASTER_TOWN_PASSWORD && process.env.MASTER_TOWN_PASWORD === provided) {
    return true;
  }
  return false;
}

export async function updateTown(coveyTownID: string, coveyTownPassword: string, friendlyName?: string, makePublic?: boolean): Promise<boolean> {
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

export class CoveyTownsStore {
  private static _instance: CoveyTownsStore;

  private _towns: CoveyTownController[] = [];

  static async getInstance(): Promise<CoveyTownsStore> {
    if (CoveyTownsStore._instance === undefined) {
      CoveyTownsStore._instance = new CoveyTownsStore();

      // populate with existing towns from DB
      const allTowns: AllTownResponse[] = await getAllTowns();
      allTowns.forEach(town => {
        const newController = new CoveyTownController(town.coveyTownID);
        CoveyTownsStore._instance._towns.push(newController);
      });
    }
    return CoveyTownsStore._instance;
  }

  getControllerForTown(coveyTownID: string): CoveyTownController | undefined {
    return this._towns.find(town => town.coveyTownID === coveyTownID);
  }

  async getTowns(): Promise<CoveyTownList> {
    const publicTowns: TownListingInfo[] = await getPublicTowns();
    const response: CoveyTownList = [];
    publicTowns.forEach(town => {
      const { coveyTownID } = town;
      const controller = this.getControllerForTown(coveyTownID);
      if (controller) {
        const capacity = controller?.capacity;
        const occupancy = controller?.occupancy;

        response.push({
          friendlyName: town.friendlyName,
          coveyTownID,
          currentOccupancy: occupancy,
          maximumOccupancy: capacity,
        });
      }
    });
    return response;
  }

  async getSavedTowns(email: string): Promise<SavedCoveyTownList> {
    const savedTowns: SavedTownListingInfo[] = await getSavedTowns(email);
    const response: SavedCoveyTownList = [];
    savedTowns.forEach(town => {
      const { coveyTownID } = town;
      const controller = this.getControllerForTown(coveyTownID);
      if (controller) {
        const capacity = controller?.capacity;
        const occupancy = controller?.occupancy;
        let publicStatus = 'private';
        if (town.publicStatus) {
          publicStatus = 'public';
        }
        response.push({
          friendlyName: town.friendlyName,
          coveyTownID,
          publicStatus,
          currentOccupancy: occupancy,
          maximumOccupancy: capacity,
        });
      }
    });
    return response;
  }

  async createTown(friendlyName: string, isPubliclyListed: boolean, userEmail: string): Promise<CreateTownResponse> {
    const townID = nanoid(30); 
    const password = nanoid(24);

    const newTown = new CoveyTownController(townID);
    this._towns.push(newTown);          

    await addNewTown(townID, password, friendlyName, isPubliclyListed, userEmail);
    
    return {coveyTownController: newTown, coveyTownPassword: password};
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
