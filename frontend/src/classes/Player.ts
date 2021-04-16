export default class Player {
  public location?: UserLocation;

  private readonly _id: string;

  private readonly _coveyUserId: string;

  private readonly _userName: string;

  public sprite?: Phaser.GameObjects.Sprite;

  public label?: Phaser.GameObjects.Text;

  constructor(id: string, coveyUserId: string, userName: string, location: UserLocation) {
    this._id = id;
    this._coveyUserId = coveyUserId;
    this._userName = userName;
    this.location = location;
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  get coveyUserId() : string {
    return this._coveyUserId;
  }

  static fromServerPlayer(playerFromServer: ServerPlayer): Player {
    return new Player(playerFromServer._id, playerFromServer._coveyUserId, playerFromServer._userName, playerFromServer.location);
  }
}
export type ServerPlayer = { _id: string, _coveyUserId: string, _userName: string, location: UserLocation };

export type Direction = 'front'|'back'|'left'|'right';

export type UserLocation = {
  x: number,
  y: number,
  rotation: Direction,
  moving: boolean
};
