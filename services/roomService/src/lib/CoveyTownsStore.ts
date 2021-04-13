import CoveyTownController from './CoveyTownController';
import { CoveyTownList } from '../CoveyTypes';

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
    }
    return CoveyTownsStore._instance;
  }

  getControllerForTown(coveyTownID: string): CoveyTownController | undefined {
    return this._towns.find(town => town.coveyTownID === coveyTownID);
  }

  getMergeableTowns(): CoveyTownList {
    return this._towns.filter(townController => 
      townController.isPubliclyListed && townController.isMergeable)
      .map(townController => ({
        coveyTownID: townController.coveyTownID,
        friendlyName: townController.friendlyName,
        currentOccupancy: townController.occupancy,
        maximumOccupancy: townController.capacity,
      }));
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

  createTown(friendlyName: string, isPubliclyListed: boolean, isMergeable?: boolean): CoveyTownController {
    const newTown = new CoveyTownController(friendlyName, isPubliclyListed, isMergeable);
    this._towns.push(newTown);
    return newTown;
  }

  updateTown(coveyTownID: string, coveyTownPassword: string, friendlyName?: string, makePublic?: boolean, makeMergeable?: boolean): boolean {
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
      if (makeMergeable !== undefined) {
        existingTown.isMergeable = makeMergeable;
      }
      return true;
    }
    return false;
  }

  mergeTowns(destinationCoveyTownID: string, requestedCoveyTownID: string, 
    coveyTownPassword: string, newTownFriendlyName: string, 
    newTownIsPubliclyListed: boolean, newTownIsMergeable: boolean): CoveyTownController | undefined {
  
    const destinationTown = this.getControllerForTown(destinationCoveyTownID);
    const requestedTown = this.getControllerForTown(requestedCoveyTownID);
    if (destinationTown && passwordMatches(coveyTownPassword, destinationTown.townUpdatePassword)
      && requestedTown) {
      destinationTown.townsMerged(destinationTown.coveyTownID, requestedTown.coveyTownID, destinationTown.friendlyName, 
        requestedTown.friendlyName, newTownFriendlyName, newTownIsPubliclyListed, newTownIsMergeable);
      requestedTown.townsMerged(destinationTown.coveyTownID, requestedTown.coveyTownID, destinationTown.friendlyName, 
        requestedTown.friendlyName, newTownFriendlyName, newTownIsPubliclyListed, newTownIsMergeable);

      this.updateTown(destinationTown.coveyTownID, destinationTown.townUpdatePassword, 
        newTownFriendlyName, newTownIsPubliclyListed, newTownIsMergeable);

      setTimeout(() => {
        destinationTown.disconnectAllPlayers();
        this.deleteTown(requestedTown.coveyTownID, requestedTown.townUpdatePassword);
      }, 7000);
        
      return destinationTown;
    }
    return undefined;
  }

  deleteTown(coveyTownID: string, coveyTownPassword: string): boolean {
    const existingTown = this.getControllerForTown(coveyTownID);
    if (existingTown && passwordMatches(coveyTownPassword, existingTown.townUpdatePassword)) {
      this._towns = this._towns.filter(town => town !== existingTown);
      existingTown.disconnectAllPlayers();
      return true;
    }
    return false;
  }

}
