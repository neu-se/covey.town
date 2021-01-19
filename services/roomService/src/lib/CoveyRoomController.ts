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
  /** The list of players currently in the room * */
  public players: Player[] = [];

  /** The list of valid sessions for this room * */
  public sessions: PlayerSession[] = [];

  /** The videoClient that this CoveyRoom will use to provision video resources * */
  public videoClient: IVideoClient = TwilioVideo.getInstance();

  /** The list of CoveyRoomListeners that are subscribed to events in this room * */
  public listeners: CoveyRoomListener[] = [];

  /** CoveyRoomController singleton * */
  private static _instance: CoveyRoomController;

  private constructor() {
    /* No-op constructor to prevent initialization from other classes */
  }

  public static getInstance(): CoveyRoomController {
    if (CoveyRoomController._instance === undefined) {
      CoveyRoomController._instance = new CoveyRoomController();
    }
    return CoveyRoomController._instance;
  }

  /**
   * Adds a player to this Covey Room, provisioning the necessary credentials for the
   * player, and returning them
   *
   * @param newPlayer The new player to add to the room
   */
  async addPlayer(newPlayer: Player): Promise<PlayerSession> {
    const theSession = new PlayerSession(newPlayer);

    this.sessions.push(theSession);
    this.players.push(newPlayer);

    // Create a video token for this user to join this room
    theSession.videoToken = await this.videoClient.getTokenForRoom('demoRoom', newPlayer.id);

    // Notify other players that this player has joined
    this.listeners.forEach((listener) => listener.onPlayerJoined(newPlayer));

    return theSession;
  }

  /**
   * Destroys all data related to a player in this room.
   *
   * @param session PlayerSession to destroy
   */
  destroySession(session: PlayerSession): void {
    this.players = this.players.filter((p) => p.id !== session.player.id);
    this.sessions = this.sessions.filter((s) => s.sessionToken !== session.sessionToken);
    this.listeners.forEach((listener) => listener.onPlayerDisconnected(session.player));
  }

  /**
   * Updates the location of a player within the room
   * @param player Player to update location for
   * @param location New location for this player
   */
  updatePlayerLocation(player: Player, location: UserLocation): void {
    // TODO: Avery should have designed this better! Mutating parameters is not a good design choice
    // eslint-disable-next-line no-param-reassign
    player.location = location;
    this.listeners.forEach((listener) => listener.onPlayerMoved(player));
  }

  /**
   * Subscribe to events from this room. Callers should make sure to
   * unsubscribe when they no longer want those events by calling removeRoomListener
   *
   * @param listener New listener
   */
  addRoomListener(listener: CoveyRoomListener): void {
    this.listeners.push(listener);
  }

  /**
   * Unsubscribe from events in this room.
   *
   * @param listener The listener to unsubscribe, must be a listener that was registered
   * with addRoomListener, or otherwise will be a no-op
   */
  removeRoomListener(listener: CoveyRoomListener): void {
    this.listeners = this.listeners.filter((v) => v !== listener);
  }

  /**
   * Fetch a player's session based on the provided session token. Returns undefined if the
   * session token is not valid.
   *
   * @param token
   */
  getSessionByToken(token: string): PlayerSession | undefined {
    return this.sessions.find((p) => p.sessionToken === token);
  }
}
