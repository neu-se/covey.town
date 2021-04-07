import { CoveyTown } from '../CoveyTypes';

export default interface IDBClient {
  saveTown(coveyTown:CoveyTown): Promise<void>;
}