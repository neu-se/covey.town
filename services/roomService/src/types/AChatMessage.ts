/* eslint-disable */
import PlayerSession from "./PlayerSession";
/**
 * TODO:
 */
export default abstract class AChatMessage{

    private _message: string
    private readonly _sender: PlayerSession

    constructor(message: string, sender: PlayerSession){
        this._message = message;
        this._sender = sender;

    }

    

    public get message(): string {
        return this._message;
      }

    public set message(message: string) {
        this._message = message;
    }

    public get sender(): PlayerSession {
        return this._sender;
    }
    
}