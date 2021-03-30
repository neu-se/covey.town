import { CoveyTownList } from '../CoveyTypes';
import CoveyHubController from './CoveyHubController';

function passwordMatches(provided: string, expected: string): boolean {
  if (provided === expected) {
    return true;
  }
  if (process.env.MASTER_TOWN_PASSWORD && process.env.MASTER_TOWN_PASWORD === provided) {
    return true;
  }
  return false;
}

export default class CoveyHubStore {
  private static _instance: CoveyHubStore;

  private _hubs: CoveyHubController[] = [];

  static getInstance(): CoveyHubStore {
    if (CoveyHubStore._instance === undefined) {
      CoveyHubStore._instance = new CoveyHubStore();
    }
    return CoveyHubStore._instance;
  }

  getControllerForHub(coveyHubID: string): CoveyHubController | undefined {
    return this._hubs.find(hub => hub.coveyHubID === coveyHubID);
  }

  getHubs(): CoveyTownList {
    return this._hubs.filter(hubController => hubController.isPubliclyListed)
      .map(hubController => ({
        coveyTownID: hubController.coveyHubID,
        friendlyName: hubController.friendlyName,
        currentOccupancy: hubController.occupancy,
        maximumOccupancy: hubController.capacity,
      }));
  }

  createHub(friendlyName: string, isPubliclyListed: boolean): CoveyHubController {
    const newHub = new CoveyHubController(friendlyName, isPubliclyListed);
    this._hubs.push(newHub);
    return newHub;
  }

  updateHub(coveyHubID: string, coveyTownPassword: string, friendlyName?: string, makePublic?: boolean): boolean {
    const existingHub = this.getControllerForHub(coveyHubID);
    if (existingHub && passwordMatches(coveyTownPassword, existingHub.townUpdatePassword)) {
      if (friendlyName !== undefined) {
        if (friendlyName.length === 0) {
          return false;
        }
        existingHub.friendlyName = friendlyName;
      }
      if (makePublic !== undefined) {
        existingHub.isPubliclyListed = makePublic;
      }
      return true;
    }
    return false;
  }

  deleteHub(coveyHubID: string, coveyTownPassword: string): boolean {
    const existingHub = this.getControllerForHub(coveyHubID);
    if (existingHub && passwordMatches(coveyTownPassword, existingHub.townUpdatePassword)) {
      this._hubs = this._hubs.filter(hub => hub !== existingHub);
      existingHub.disconnectAllPlayers();
      return true;
    }
    return false;
  }

}
