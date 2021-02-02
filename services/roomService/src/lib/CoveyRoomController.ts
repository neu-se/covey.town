import { nanoid } from 'nanoid';
import { UserLocation } from '../CoveyTypes';
import CoveyRoomListener from '../types/CoveyRoomListener';
import Player from '../types/Player';
import PlayerSession from '../types/PlayerSession';
import TwilioVideo from './TwilioVideo';
import IVideoClient from './IVideoClient';

/**
 * The CoveyRoomController implements the logic for each room: managing the various events that
 * can occur (e.g. joining a room, moving, leaving a room)
 */
export default class CoveyRoomController {
  set isPubliclyListed(value: boolean) {
    this._isPubliclyListed = value;
  }

  get isPubliclyListed(): boolean {
    return this._isPubliclyListed;
  }

  get roomUpdatePassword(): string {
    return this._roomUpdatePassword;
  }

  get players(): Player[] {
    return this._players;
  }

  get friendlyName(): string {
    return this._friendlyName;
  }

  set friendlyName(value: string) {
    this._friendlyName = value;
  }

  get coveyRoomID(): string {
    return this._coveyRoomID;
  }

  /** The list of players currently in the room * */
  private _players: Player[] = [];

  /** The list of valid sessions for this room * */
  private _sessions: PlayerSession[] = [];

  /** The videoClient that this CoveyRoom will use to provision video resources * */
  private _videoClient: IVideoClient = TwilioVideo.getInstance();

  /** The list of CoveyRoomListeners that are subscribed to events in this room * */
  private _listeners: CoveyRoomListener[] = [];

  private readonly _coveyRoomID: string;

  private _friendlyName: string;

  private readonly _roomUpdatePassword: string;

  private _isPubliclyListed: boolean;

  constructor(friendlyName: string, isPubliclyListed: boolean) {
    this._coveyRoomID = nanoid(12);
    this._roomUpdatePassword = nanoid(24);
    this._isPubliclyListed = isPubliclyListed;
    this._friendlyName = friendlyName;
  }

  /**
   * Adds a player to this Covey Room, provisioning the necessary credentials for the
   * player, and returning them
   *
   * @param newPlayer The new player to add to the room
   */
  async addPlayer(newPlayer: Player): Promise<PlayerSession> {
    const theSession = new PlayerSession(newPlayer);

    this._sessions.push(theSession);
    this._players.push(newPlayer);

    // Create a video token for this user to join this room
    theSession.videoToken = await this._videoClient.getTokenForRoom(this._coveyRoomID, newPlayer.id);

    // Notify other players that this player has joined
    this._listeners.forEach((listener) => listener.onPlayerJoined(newPlayer));

    return theSession;
  }

  /**
   * Destroys all data related to a player in this room.
   *
   * @param session PlayerSession to destroy
   */
  destroySession(session: PlayerSession): void {
    this._players = this._players.filter((p) => p.id !== session.player.id);
    this._sessions = this._sessions.filter((s) => s.sessionToken !== session.sessionToken);
    this._listeners.forEach((listener) => listener.onPlayerDisconnected(session.player));
  }

  /**
   * Updates the location of a player within the room
   * @param player Player to update location for
   * @param location New location for this player
   */
  updatePlayerLocation(player: Player, location: UserLocation): void {
    player.updateLocation(location);
    this._listeners.forEach((listener) => listener.onPlayerMoved(player));
  }

  /**
   * Subscribe to events from this room. Callers should make sure to
   * unsubscribe when they no longer want those events by calling removeRoomListener
   *
   * @param listener New listener
   */
  addRoomListener(listener: CoveyRoomListener): void {
    this._listeners.push(listener);
  }

  /**
   * Unsubscribe from events in this room.
   *
   * @param listener The listener to unsubscribe, must be a listener that was registered
   * with addRoomListener, or otherwise will be a no-op
   */
  removeRoomListener(listener: CoveyRoomListener): void {
    this._listeners = this._listeners.filter((v) => v !== listener);
  }

  /**
   * Fetch a player's session based on the provided session token. Returns undefined if the
   * session token is not valid.
   *
   * @param token
   */
  getSessionByToken(token: string): PlayerSession | undefined {
    return this._sessions.find((p) => p.sessionToken === token);
  }

  /**
   * Notify all players connected to this room that the room is being destroyed, terminating
   * their connection and freeing any relevant resources.
   */
  disconnectAllPlayers(): void {
    this._listeners.forEach((listener) => listener.onRoomDestroyed());
  }
}
