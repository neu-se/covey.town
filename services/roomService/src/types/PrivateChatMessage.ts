import AChatMessage from './AChatMessage';
import PlayerSession from './PlayerSession';
/**
 * TODO:
 */
export default class PrivateChatMessage extends AChatMessage {
  private _receiver: PlayerSession;

  constructor(message: string, sender: PlayerSession, receiver: PlayerSession) {
    super(message, sender);
    this._receiver = receiver;
  }
}
