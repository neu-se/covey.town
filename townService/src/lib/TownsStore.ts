import { ITiledMap } from '@jonbell/tiled-map-type-guard';
import * as fs from 'fs/promises';
import { customAlphabet } from 'nanoid';
import Town from '../town/Town';
import { TownEmitterFactory } from '../types/CoveyTownSocket';

function passwordMatches(provided: string, expected: string): boolean {
  if (provided === expected) {
    return true;
  }
  if (process.env.MASTER_TOWN_PASSWORD && process.env.MASTER_TOWN_PASWORD === provided) {
    return true;
  }
  return false;
}

const friendlyNanoID = customAlphabet('1234567890ABCDEF', 8);

export type TownList = {
  friendlyName: string;
  townID: string;
  currentOccupancy: number;
  maximumOccupancy: number;
}[];

export default class TownsStore {
  private static _instance: TownsStore;

  private _towns: Town[] = [];

  private _emitterFactory: TownEmitterFactory;

  static initializeTownsStore(emitterFactory: TownEmitterFactory) {
    TownsStore._instance = new TownsStore(emitterFactory);
  }

  /**
   * Retrieve the singleton TownsStore.
   *
   * There is only a single instance of the TownsStore - it follows the singleton pattern
   */
  static getInstance(): TownsStore {
    if (TownsStore._instance === undefined) {
      throw new Error('TownsStore must be initialized before getInstance is called');
    }
    return TownsStore._instance;
  }

  private constructor(emitterFactory: TownEmitterFactory) {
    this._emitterFactory = emitterFactory;
  }

  /**
   * Given a town ID, fetch the town model
   *
   * @param townID town ID to fetch
   * @returns the existing town controller, or undefined if there is no such town ID
   */
  getTownByID(townID: string): Town | undefined {
    return this._towns.find(town => town.townID === townID);
  }

  /**
   * @returns List of all publicly visible towns
   */
  getTowns(): TownList {
    return this._towns
      .filter(townController => townController.isPubliclyListed)
      .map(townController => ({
        townID: townController.townID,
        friendlyName: townController.friendlyName,
        currentOccupancy: townController.occupancy,
        maximumOccupancy: townController.capacity,
      }));
  }

  /**
   * Creates a new town, registering it in the Town Store, and returning that new town
   * @param friendlyName
   * @param isPubliclyListed
   * @returns the new town controller
   */
  async createTown(
    friendlyName: string,
    isPubliclyListed: boolean,
    mapFile = '../frontend/public/assets/tilemaps/indoors.json',
  ): Promise<Town> {
    if (friendlyName.length === 0) {
      throw new Error('FriendlyName must be specified');
    }
    const townID = process.env.DEMO_TOWN_ID === friendlyName ? friendlyName : friendlyNanoID();
    const newTown = new Town(friendlyName, isPubliclyListed, townID, this._emitterFactory(townID));
    const data = JSON.parse(await fs.readFile(mapFile, 'utf-8'));
    const map = ITiledMap.parse(data);
    newTown.initializeFromMap(map);
    this._towns.push(newTown);
    return newTown;
  }

  /**
   * Updates an existing town. Validates that the provided password is valid
   * @param townID
   * @param townUpdatePassword
   * @param friendlyName
   * @param makePublic
   * @returns true upon success, or false otherwise
   */
  updateTown(
    townID: string,
    townUpdatePassword: string,
    friendlyName?: string,
    makePublic?: boolean,
  ): boolean {
    const existingTown = this.getTownByID(townID);
    if (existingTown && passwordMatches(townUpdatePassword, existingTown.townUpdatePassword)) {
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

  /**
   * Deletes a given town from this towns store, destroying the town controller in the process.
   * Checks that the password is valid before deletion
   * @param townID
   * @param townUpdatePassword
   * @returns true if the town exists and is successfully deleted, false otherwise
   */
  deleteTown(townID: string, townUpdatePassword: string): boolean {
    const existingTown = this.getTownByID(townID);
    if (existingTown && passwordMatches(townUpdatePassword, existingTown.townUpdatePassword)) {
      this._towns = this._towns.filter(town => town !== existingTown);
      existingTown.disconnectAllPlayers();
      return true;
    }
    return false;
  }
}
