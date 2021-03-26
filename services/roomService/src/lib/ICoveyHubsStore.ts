import CoveyHubController from './CoveyHubController';

/**
 * An abstraction for a class that will track all of the towns
 */
export default interface ICoveyHubStore {
  /**
   * Retrieve the CoveyTownController for a given town. If no controller exists,
   * this method should create one.
   *
   * @param coveyHubID the ID of the requested town
   */
  getControllerForHub(coveyHubID: string): CoveyHubController
}
