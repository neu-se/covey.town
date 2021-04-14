import Player from './Player';
/**
 * TODO:
 */
export default abstract class AChatMessage {
  private _message: string;

  private readonly _sender: Player;

  constructor(message: string, sender: Player) {
    this._message = message;
    this._sender = sender;
  }

  public get message(): string {
    return this._message;
  }

  public set message(message: string) {
    this._message = message;
  }

  public get sender(): Player {
    return this._sender;
  }
}
