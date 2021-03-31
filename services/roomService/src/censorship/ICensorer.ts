export default interface ICensorer {

      /**
   * Censors banned words from the incoming message, changing the characters to stars, doesn't change unbanned words
   * returns the censored version of the message
   *
   * @param incomingMessage the message to be censored
   */
  censorMessage(incomingMessage: string): string

}