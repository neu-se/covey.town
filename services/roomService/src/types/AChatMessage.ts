/**
 * An AChatMessage represents a message sent by one Player to some other Players in the same town.
 * The receipients of the messages vary and are specified in the classes extending AChatMessage
 */
export default abstract class AChatMessage {
  /** The text the Player wants to send */
  private _message: string;

  /** The ID of the Player sending the message */
  private readonly _senderID: string;

  constructor(message: string, senderID: string) {
    this._message = message;
    this._senderID = senderID;
  }

  public get message(): string {
    return this._message;
  }

  public set message(message: string) {
    this._message = message;
  }

  public get senderID(): string {
    return this._senderID;
  }

  abstract getType(): string;

  abstract getReceiverID(): string;
}
