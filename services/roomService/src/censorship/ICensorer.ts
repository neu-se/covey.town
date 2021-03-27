
export default interface ICensorer {

      /**
   * Retrieve the CoveyTownController for a given town. If no controller exists,
   * this method should create one.
   *
   * @param coveyTownID the ID of the requested town
   */
  censorMessage(incomingMessage: string): string

}