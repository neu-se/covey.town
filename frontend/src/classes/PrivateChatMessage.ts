import AChatMessage from './AChatMessage';

export default class PrivateChatMessage extends AChatMessage {

  private _receiverID: string;

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
