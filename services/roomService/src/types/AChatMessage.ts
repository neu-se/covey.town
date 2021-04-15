export default abstract class AChatMessage {
  private _message: string;

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
