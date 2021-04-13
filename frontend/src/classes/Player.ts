export default class Player {
  public location?: UserLocation;

  private readonly _id: string;

  private readonly _userName: string;

  private readonly _avatarID: string;

  public sprite?: Phaser.GameObjects.Sprite;

  public label?: Phaser.GameObjects.Text;

  constructor(id: string, userName: string, location: UserLocation, avatarID?: string) {
    this._id = id;
    this._userName = userName;
    this.location = location;
    this._avatarID = avatarID || 'misa';
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  get avatarID(): string {
    return this._avatarID;
  }

  static fromServerPlayer(playerFromServer: ServerPlayer): Player {
    return new Player(
      playerFromServer._id,
      playerFromServer._userName,
      playerFromServer.location,
      playerFromServer._avatarID,
    );
  }
}
export type ServerPlayer = {
  _id: string;
  _userName: string;
  location: UserLocation;
  _avatarID: string;
};

export type Direction = 'front' | 'back' | 'left' | 'right';

export type UserLocation = {
  x: number;
  y: number;
  rotation: Direction;
  moving: boolean;
};
