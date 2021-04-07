import AChatMessage from './AChatMessage';
import PlayerSession from './PlayerSession';
/**
 * TODO:
 */
export default class PrivateChatMessage extends AChatMessage {
  private _receiver: PlayerSession;

  constructor(message: string, sender: PlayerSession, townID: string, receiver: PlayerSession) {
    super(message, sender, townID);
    this._receiver = receiver;
  }
}