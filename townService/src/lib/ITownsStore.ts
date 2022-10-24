import Town from '../town/Town';

/**
 * An abstraction for a class that will track all of the towns
 */
export default interface ITownsStore {
  /**
   * Retrieve the Town for a given town ID. If no town exists,
   * this method should create one.
   *
   * @param townID the ID of the requested town
   */
  getTownByID(townID: string): Town;
}
