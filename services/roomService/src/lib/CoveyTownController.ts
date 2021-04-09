import { customAlphabet, nanoid } from 'nanoid';
import { UserLocation } from '../CoveyTypes';
import CoveyTownListener from '../types/CoveyTownListener';
import Player from '../types/Player';
import CoveyHubStore from './CoveyHubStore';
import CoveyHubController from './CoveyHubController';
import PlayerSession from '../types/PlayerSession';
import TwilioVideo from './TwilioVideo';
import IVideoClient from './IVideoClient';

const friendlyNanoID = customAlphabet('1234567890ABCDEF', 8);

/**
 * The CoveyTownController implements the logic for each town: managing the various events that
 * can occur (e.g. joining a town, moving, leaving a town)
 */
export default class CoveyTownController {

  get capacity(): number {
    return this._capacity;
  }

  set isPubliclyListed(value: boolean) {
    this._isPubliclyListed = value;
  }

  get isPubliclyListed(): boolean {
    return this._isPubliclyListed;
  }

  get townUpdatePassword(): string {
    return this._townUpdatePassword;
  }

  get players(): Player[] {
    return this._players;
  }

  get occupancy(): number {
    return this._listeners.length;
  }

  get friendlyName(): string {
    return this._friendlyName;
  }

  set friendlyName(value: string) {
    this._friendlyName = value;
  }

  get coveyTownID(): string {
    return this._coveyTownID;
  }

  get hubs(): CoveyHubController[] {
    return this._hubs; 
  }

  /** The List of Hubs in the town */
  private _hubs: CoveyHubController[] = [];

  /** The list of players currently in the town * */
  private _players: Player[] = [];

  /** The list of valid sessions for this town * */
  private _sessions: PlayerSession[] = [];

  /** The videoClient that this CoveyTown will use to provision video resources * */
  private _videoClient: IVideoClient = TwilioVideo.getInstance();

  /** The list of CoveyTownListeners that are subscribed to events in this town * */
  private _listeners: CoveyTownListener[] = [];

  private readonly _coveyTownID: string;

  private _friendlyName: string;

  private readonly _townUpdatePassword: string;

  private _isPubliclyListed: boolean;

  private _capacity: number;

  constructor(friendlyName: string, isPubliclyListed: boolean) {
    this._coveyTownID = (process.env.DEMO_TOWN_ID === friendlyName ? friendlyName : friendlyNanoID());
    this._capacity = 50;
    this._townUpdatePassword = nanoid(24);
    this._isPubliclyListed = isPubliclyListed;
    this._friendlyName = friendlyName;
    const hubsStore = CoveyHubStore.getInstance();
    const hospitalHub = hubsStore.createHub('Hospital', true, this._coveyTownID );
    this._hubs.push(hospitalHub);
    const schoolHub = hubsStore.createHub('School', true, this._coveyTownID );
    this._hubs.push(schoolHub);
    // Add Private Hubs
    const privHub1 = hubsStore.createHub('House_1', true, this._coveyTownID );
    this._hubs.push(privHub1);
    const privHub2 = hubsStore.createHub('House_2', true, this._coveyTownID );
    this._hubs.push(privHub2);
    const privHub3 = hubsStore.createHub('House_3', true, this._coveyTownID );
    this._hubs.push(privHub3);
    const privHub4 = hubsStore.createHub('House_4', true, this._coveyTownID );
    this._hubs.push(privHub4);
    const privHub5 = hubsStore.createHub('House_5', true, this._coveyTownID );
    this._hubs.push(privHub5);
    const privHub6 = hubsStore.createHub('House_6', true, this._coveyTownID );
    this._hubs.push(privHub6);
    
  }

  /**
   * Adds a player to this Covey Town, provisioning the necessary credentials for the
   * player, and returning them
   *
   * @param newPlayer The new player to add to the town
   */
  async addPlayer(newPlayer: Player): Promise<PlayerSession> {
    const theSession = new PlayerSession(newPlayer);

    this._sessions.push(theSession);
    this._players.push(newPlayer);

    // Create a video token for this user to join this town
    theSession.videoToken = await this._videoClient.getTokenForTown(this._coveyTownID, newPlayer.id);

    // Notify other players that this player has joined
    this._listeners.forEach((listener) => listener.onPlayerJoined(newPlayer));

    return theSession;
  }

  /**
   * Destroys all data related to a player in this town.
   *
   * @param session PlayerSession to destroy
   */
  destroySession(session: PlayerSession): void {
    this._players = this._players.filter((p) => p.id !== session.player.id);
    this._sessions = this._sessions.filter((s) => s.sessionToken !== session.sessionToken);
    this._listeners.forEach((listener) => listener.onPlayerDisconnected(session.player));
  }

  /**
   * Updates the location of a player within the town
   * @param player Player to update location for
   * @param location New location for this player
   */
  updatePlayerLocation(player: Player, location: UserLocation): void {
    player.updateLocation(location);
    this._listeners.forEach((listener) => listener.onPlayerMoved(player));
  }

  /**
   * Subscribe to events from this town. Callers should make sure to
   * unsubscribe when they no longer want those events by calling removeTownListener
   *
   * @param listener New listener
   */
  addTownListener(listener: CoveyTownListener): void {
    this._listeners.push(listener);
  }

  /**
   * Unsubscribe from events in this town.
   *
   * @param listener The listener to unsubscribe, must be a listener that was registered
   * with addTownListener, or otherwise will be a no-op
   */
  removeTownListener(listener: CoveyTownListener): void {
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


  disconnectAllPlayers(): void {
    this._listeners.forEach((listener) => listener.onTownDestroyed());
  }

  getHubControllers(): CoveyHubController[]{
    return this._hubs;
  }
}
