import { nanoid } from 'nanoid';
import Player from './Player';

/*
 A session represents a connection of a player to a town, storing the secret tokens
 that this player uses to access resources in the town
 */
export default class PlayerSession {
  /** The player that this session represents * */
  private readonly _player: Player;

  /** The secret token that allows this client to access our Covey.Town service for this town * */
  private readonly _sessionToken: string;

  /** The secret token that allows this client to access our video resources for this town * */
  private _videoToken?: string;

  constructor(player: Player) {
    this._player = player;
    // Session tokens are randomly generated strings
    this._sessionToken = nanoid();
  }

  set videoToken(value: string | undefined) {
    this._videoToken = value;
  }

  get videoToken(): string | undefined {
    return this._videoToken;
  }

  get player(): Player {
    return this._player;
  }

  get sessionToken(): string {
    return this._sessionToken;
  }
}
