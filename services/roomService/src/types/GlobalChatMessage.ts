import AChatMessage from './AChatMessage';

/**
 * A GlobalChatMessage represents a message sent by one Player to every other Player in the town.
 */
export default class GlobalChatMessage extends AChatMessage {
  /** A string representing the type of AChatMessage this is */
  private _type: string;

  constructor(message: string, senderID: string) {
    super(message, senderID);
    this._type = 'global';
  }

  getType(): string {
    return this._type;
  }

  getReceiverID(): string {
    return this.senderID;
  }
}
