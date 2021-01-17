import { Socket } from 'socket.io-client';

export type CoveyEvent = 'playerMoved' | 'playerAdded' | 'playerRemoved';
export type CoveyCallback = (data: any) => void;
export type Direction = 'front'|'back'|'left'|'right';

export type UserLocation = {
  x: number,
  y: number,
  rotation: Direction,
  moving: boolean
};
export type VideoRoom = {
  twilioID: string,
  id: string
};
export type UserProfile = {
  displayName: string,
  id: string
};
export type NearbyPlayers = {
  nearbyPlayers: Player[]
};
export type CoveyAppState = {
  sessionToken: string,
  userName: string,
  currentRoom: string,
  myPlayerID: string,
  players: Player[],
  currentLocation: UserLocation,
  nearbyPlayers: NearbyPlayers,
  emitMovement: (location: UserLocation) => void,
  socket: Socket | null,
};
export class Player {
  public location?: UserLocation;

  private readonly _id: string;

  private readonly _userName: string;

  public sprite?: Phaser.GameObjects.Sprite;

  public label?: Phaser.GameObjects.Text;

  constructor(player: ServerPlayer) {
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
};
