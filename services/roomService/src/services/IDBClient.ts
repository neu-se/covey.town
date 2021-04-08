import { CoveyTown } from '../CoveyTypes';

export default interface IDBClient {
  saveTown(coveyTown: CoveyTown): Promise<void>;
  deleteTown(coveyTownID: string): Promise<void>;
  getTowns(): Promise<CoveyTown[]>;
}