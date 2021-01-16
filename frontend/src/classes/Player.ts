import {UserLocation} from "../CoveyTypes";
import {nanoid} from "nanoid";

export default class Player {
    public location?: UserLocation;
    private readonly _id: string;
    private readonly _userName: string;
    public sprite?: Phaser.GameObjects.Sprite;
    public label?: Phaser.GameObjects.Text;

    constructor(player: ServerPlayer){
        this._id = player._id;
        this._userName = player._userName;
        this.location = player.location;
    }

    get userName() {
        return this._userName;
    }

    get id() {
        return this._id;
    }

    // get location() {
    //     return this._location;
    // }
    //
    // set location(location: UserLocation) {
    //     this._location = location;
    // }

}

export type ServerPlayer = {
    _id: string;
    _userName: string;
    location?: UserLocation;
}
