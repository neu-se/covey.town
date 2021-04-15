import { CoveyTownList } from '../CoveyTypes';
import CoveyTownController from './CoveyTownController';

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

  getTowns(): CoveyTownList {
    return this._towns
      .filter(townController => townController.isPubliclyListed)
      .map(townController => ({
        coveyTownID: townController.coveyTownID,
        friendlyName: townController.friendlyName,
        currentOccupancy: townController.occupancy,
        maximumOccupancy: townController.capacity,
      }));
  }

  createTown(friendlyName: string, isPubliclyListed: boolean): CoveyTownController {
    const newTown = new CoveyTownController(friendlyName, isPubliclyListed);
    this._towns.push(newTown);
    return newTown;
  }

  updateTown(
    coveyTownID: string,
    coveyTownPassword: string,
    friendlyName?: string,
    makePublic?: boolean,
  ): boolean {
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
      return true;
    }
    return false;
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

  /**
   * Sends a private message between two specified Players in the given town.
   * 
   * @param coveyTownID The ID of the town the sending Player is sending the message in. The receiving Player should also be in this town.
   * @param userIDFrom  The ID of the Player sending the message.
   * @param userIDTo    The ID of the Player receiving the message.
   * @param message     The message being sent.
   * @returns           True if the message is sent in the given town, false if the town doesn't exist.
   */
  sendPrivateMessage(
    coveyTownID: string,
    userIDFrom: string,
    userIDTo: string,
    message: string,
  ): boolean {
    const currentTown = this.getControllerForTown(coveyTownID);
    if (currentTown) {
      currentTown.sendPrivatePlayerMessage(userIDFrom, userIDTo, message);
      return true;
    }
    return false;
  }

  /**
   * Sends a global message from the given Player to all of the Players in the given town.
   * 
   * @param coveyTownID The ID of the town the sending Player is sending the message in.
   * @param userID      The ID of the Player sending the message.
   * @param message     The message being sent.
   * @returns           True if the message is sent in the given town, false if the town doesn't exist.
   */
  sendGlobalMessage(coveyTownID: string, userID: string, message: string): boolean {
    const currentTown = this.getControllerForTown(coveyTownID);
    if (currentTown) {
      currentTown.sendGlobalPlayerMessage(userID, message);
      return true;
    }
    return false;
  }
}
