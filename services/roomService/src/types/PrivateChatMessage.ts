import AChatMessage from './AChatMessage';
import Player from './Player';
/**
 * TODO:
 */
export default class PrivateChatMessage extends AChatMessage {
  private _receiver: Player;

  constructor(message: string, sender: Player, receiver: Player) {
    super(message, sender);
    this._receiver = receiver;
  }
}
