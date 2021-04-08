import { customAlphabet, nanoid } from 'nanoid';
import { UserLocation } from '../CoveyTypes';
import CoveyTownListener from '../types/CoveyTownListener';
import Player from '../types/Player';
import PlayerSession from '../types/PlayerSession';
import TwilioVideo from './TwilioVideo';
import IVideoClient from './IVideoClient';
import PlayerMessage from '../types/PlayerMessage';
import PlayerMention from '../types/PlayerMention';

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
    return this._listeners.size;
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

  get townChat(): PlayerMessage[] {
    return this._townChat;
  }


  /** The list of players currently in the town * */
  private _players: Player[] = [];

  /** The list of valid sessions for this town * */
  private _sessions: PlayerSession[] = [];

  /** The videoClient that this CoveyTown will use to provision video resources * */
  private _videoClient: IVideoClient = TwilioVideo.getInstance();

  /** The list of CoveyTownListeners that are subscribed to events in this town * */
  private _listeners: Map<string, CoveyTownListener> = new Map();

  private readonly _coveyTownID: string;

  private _friendlyName: string;

  private readonly _townUpdatePassword: string;

  private _isPubliclyListed: boolean;

  private _capacity: number;

  private readonly _townChat: PlayerMessage[];

  private readonly privateChats: Map<Set<string>, Array<PlayerMessage>>;

  constructor(friendlyName: string, isPubliclyListed: boolean) {
    this._coveyTownID = (process.env.DEMO_TOWN_ID === friendlyName ? friendlyName : friendlyNanoID());
    this._capacity = 50;
    this._townUpdatePassword = nanoid(24);
    this._isPubliclyListed = isPubliclyListed;
    this._friendlyName = friendlyName;
    this.privateChats = new Map();
    this._townChat = [];
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
   * @param listener the listener for the user
   * @param userId the id to key the listener by
   */
  addTownListener(listener: CoveyTownListener, userId: string): void {
    this._listeners.set(userId, listener);
  }

  /**
   * Unsubscribe from events in this town.
   *
   * @param listener The listener to unsubscribe, must be a listener that was registered
   * with addTownListener, or otherwise will be a no-op
   */
  removeTownListener(listener: CoveyTownListener): void {
    this._listeners.forEach((v, k) => v === listener ? this._listeners.delete(k) : null);
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

  sendMessage(message: PlayerMessage): void {
    if (!this._listeners.get(message.senderProfileId)) {
      throw new Error('Invalid sender profile id');
    }
    switch (typeof message.recipient) {
      case 'object': // Object type indicates the message is private
        this.sendPrivateMessage(message);
        break;
      default: // Default is for the whole town
        this._townChat.push(message);
        this._listeners.forEach(listener => listener.onPlayerMessage(message));
    }
  }


  sendPlayerMention(message: PlayerMention): void {
    if (!this._listeners.get(message.senderProfileId)) {
      throw new Error('Invalid sender profile id');
    }


    const recipientListener: CoveyTownListener | undefined = this._listeners.get(message.recipient);
    if (!recipientListener) {
      throw new Error('Invalid recipient id');
    }
    recipientListener.onPlayerMention(message);


  }

  private sendPrivateMessage(message: PlayerMessage) {
    let player1Listener: CoveyTownListener | undefined;
    let player2Listener: CoveyTownListener | undefined;
    if (typeof message.recipient === 'object') {
      player1Listener = this._listeners.get(message.recipient.recipientId);
      player2Listener = this._listeners.get(message.senderProfileId);
      if (!player1Listener || !player2Listener) {
        throw new Error('Invalid recipient id');
      }

      const privateMessageSet = new Set<string>();
      privateMessageSet.add(message.recipient.recipientId);
      privateMessageSet.add(message.senderProfileId);
      let privateMessages = this.privateChats.get(privateMessageSet);
      if (!privateMessages) {
        this.privateChats.set(privateMessageSet, []);
        privateMessages = this.privateChats.get(privateMessageSet);
      }
      if (privateMessages) {
        privateMessages.push(message);
      }
      player1Listener.onPlayerMessage(message);
      player2Listener.onPlayerMessage(message);
    }
  }
}
