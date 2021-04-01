/* eslint-disable */
import Player from "./Player";
/**
 * TODO:
 */
export default abstract class AChatMessage{

    private _message: string
    private readonly _sender: Player
    private readonly _townID: string

    constructor(message: string, sender: Player, townID: string){
        this._message = message;
        this._sender = sender;
        this._townID = townID;
    }
/*
    get _message(): string {
        return this._message;
      }

    set _message(message: string): void {
        this._message = message;
    }

    get _userName(): string {
        return this._userName;
      }

    get _senderID(): string {
        return this._senderID;
    }

    get _townID(): string {
        return this._townID;
    }
    */
}