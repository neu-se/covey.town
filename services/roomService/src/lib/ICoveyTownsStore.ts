import CoveyTownController from './CoveyTownController';

/**
 * An abstraction for a class that will track all of the towns
 */
export default interface ICoveyTownsStore {
  /**
   * Retrieve the CoveyTownController for a given town. If no controller exists,
   * this method should create one.
   *
   * @param coveyTownID the ID of the requested town
   */
  getControllerForTown(coveyTownID: string): CoveyTownController
}
