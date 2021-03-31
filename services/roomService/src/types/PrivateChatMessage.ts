import AChatMessage from "./AChatMessage";
import Player from "./Player";
/**
 * TODO:
 */
export default class PrivateChatMessage extends AChatMessage {
    private _receiver: Player

    constructor(message: string, sender: Player, townID: string, receiver: Player) {
        super(message, sender, townID);
        this._receiver = receiver
    }
}