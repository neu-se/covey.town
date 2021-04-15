import AChatMessage from './AChatMessage';

/**
 * A PrivateChatMessage represents a message sent by one Player to another Player in the same town that only the two of them can see.
 */
export default class PrivateChatMessage extends AChatMessage {
  /** The ID of the Player receiving the message */
  private _receiverID: string;

  /** A string representing the type of AChatMessage this is */
  private _type: string;

  constructor(message: string, senderID: string, receiverID: string) {
    super(message, senderID);
    this._receiverID = receiverID;
    this._type = 'private';
  }

  getType(): string {
    return this._type;
  }

  getReceiverID(): string {
    return this._receiverID;
  }
}
