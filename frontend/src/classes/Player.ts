export default class Player {
  public location?: UserLocation;

  private readonly _id: string;

  private readonly _userName: string;

  private readonly _character: Character;

  public sprite?: Phaser.GameObjects.Sprite;

  public label?: Phaser.GameObjects.Text;

  constructor(id: string, userName: string, location: UserLocation, character: Character) {
    this._id = id;
    this._userName = userName;
    this.location = location;
    this._character = character;
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  get character(): Character {
    return this._character;
}

  static fromServerPlayer(playerFromServer: ServerPlayer): Player {
    return new Player(playerFromServer._id, playerFromServer._userName, playerFromServer.location, playerFromServer._character);
  }
}
export type ServerPlayer = { _id: string, _userName: string, location: UserLocation, _character: Character };

export type Direction = 'front'|'back'|'left'|'right';

export type Character = 'misa-blond-hair'|'misa-red-hair'|'misa-green-hair'|'misa-blue-hair';

export const characterTypes: Character[] = ['misa-blond-hair', 'misa-red-hair', 'misa-green-hair', 'misa-blue-hair'];

export type UserLocation = {
  x: number,
  y: number,
  rotation: Direction,
  moving: boolean
};
