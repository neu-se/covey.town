export default class Player {
  public location?: UserLocation;

  private readonly _id: string;

  private readonly _userName: string;

  // mapID field added by MD
  private readonly _mapID: string;

  public sprite?: Phaser.GameObjects.Sprite;

  public label?: Phaser.GameObjects.Text;

  constructor(id: string, userName: string, location: UserLocation, mapID: string) {
    this._id = id;
    this._userName = userName;
    this.location = location;
    // mapID added to constructor by MD
    this._mapID = mapID;
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  // mapID getter added by MD
  get mapID(): string {
    return this._mapID;
  }

  // updated to include new mapID parameter by MD  
  static fromServerPlayer(playerFromServer: ServerPlayer): Player {
    return new Player(playerFromServer._id, playerFromServer._userName, playerFromServer.location, playerFromServer._mapID);
  }
}
// server player updated to include mapID by MD
export type ServerPlayer = { _id: string, _userName: string, location: UserLocation, _mapID: string };

export type Direction = 'front'|'back'|'left'|'right';

export type UserLocation = {
  x: number,
  y: number,
  rotation: Direction,
  moving: boolean
};
