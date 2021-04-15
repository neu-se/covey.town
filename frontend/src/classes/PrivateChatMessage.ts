import AChatMessage from './AChatMessage';

export default class PrivateChatMessage extends AChatMessage {
  private _receiverID: string;

  constructor(message: string, senderID: string, receiverID: string) {
    super(message, senderID);
    this._receiverID = receiverID;
  }
}
