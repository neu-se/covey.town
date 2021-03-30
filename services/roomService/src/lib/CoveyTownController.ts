import { customAlphabet, nanoid } from 'nanoid';
import { UserLocation, videoActionTimeStamp, YoutubeVideoInfo } from '../CoveyTypes';
import CoveyTownListener from '../types/CoveyTownListener';
import Player from '../types/Player';
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

  // Andrew - map of players to listeners so that controller knows which listener to use when a specific player
  // needs something
  private _listenersInTVAreaMap: Map<Player, CoveyTownListener> = new Map<Player, CoveyTownListener>();

  // Andrew - map of players to their current video info. Players are recorded so that their video info is 
  // removed from this map when they leave the tv area

  private _currentVideoInfoMap: Map<Player, YoutubeVideoInfo> = new Map<Player, YoutubeVideoInfo>();

  // Andrew - default video info to send to player that is first to join tv area
  private _defaultVideoInfo: YoutubeVideoInfo = { 
    url: 'https://www.youtube.com/watch?v=5kcdRBHM7kM', // mario video
    timestamp: 0,
    isPlaying: true,
  };

  public _videActionTimeStamps : videoActionTimeStamp[] = []

  // Andrew - map of video URL to how many votes it has received so that, at the end of the current video, the
  // server can choose the next video URL and send it to each client to play. 
  private _videoURLVotes: Map<string, number> = new Map<string, number>();

  constructor(friendlyName: string, isPubliclyListed: boolean) {
    this._coveyTownID = (process.env.DEMO_TOWN_ID === friendlyName ? friendlyName : friendlyNanoID());
    this._capacity = 50;
    this._townUpdatePassword = nanoid(24);
    this._isPubliclyListed = isPubliclyListed;
    this._friendlyName = friendlyName;
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

  // Andrew - have every client pause their video
  pauseVideos(): void {
    this._videActionTimeStamps.push( { actionType: 'pause', actionDate: new Date()  })
    // console.log(this._videActionTimeStamps)
    this._listeners.forEach((listener) => listener.onPlayerPaused());
  }

  // Andrew - have every client play their video
  playVideos(): void {
    this._videActionTimeStamps.push( { actionType: 'play', actionDate: new Date()  })
    // console.log(this._videActionTimeStamps)
    // this._videActionTimeStamps.push( { actionType: 'play', actionDate: new Date()  })
    this._listeners.forEach((listener) => listener.onPlayerPlayed());
  }

  // Andrew - if player is first to enter, then emit message to client to play default video. 
  // Otherwise, emit message to client to load curent video at timestamp of the other players. 
  addToTVArea(playerToAdd: Player, listenerToAdd: CoveyTownListener) {
    this._listenersInTVAreaMap.set(playerToAdd, listenerToAdd);
    if (this._listenersInTVAreaMap.size === 1) {
      // Clearning old time stamps
      this._videActionTimeStamps = []
      //Adding the initial one for this video
      this._videActionTimeStamps.push( {actionType: 'add', actionDate: new Date() })
      listenerToAdd.onVideoSyncing(this._defaultVideoInfo);
    } else {
      // get video info from map that is constantly updating with current video infos.
      const firstPersonKey = this._currentVideoInfoMap.keys().next().value;
      // get youtube info
      const firstPersonYoutubeVideoInfo = this._currentVideoInfoMap.get(firstPersonKey)

      // the
      let a = this._videActionTimeStamps[0].actionDate;
      const lastPause = this._videActionTimeStamps.reduce(function(prev, current) {
        return (prev.actionDate.getDate > current.actionDate.getDate && current.actionType === 'pause') ? prev : current
      });
      // console.log(this._videActionTimeStamps)
      // console.log(lastPause.actionDate)

      // Account for cases
      const currentTime = lastPause.actionDate.getTime() - this._videActionTimeStamps[1].actionDate.getTime()

      if (firstPersonYoutubeVideoInfo){
        const upToDateVideoInfo: YoutubeVideoInfo | undefined = { url: firstPersonYoutubeVideoInfo.url, timestamp:  currentTime / 1000, isPlaying : firstPersonYoutubeVideoInfo.isPlaying };
        if (upToDateVideoInfo) {
          listenerToAdd.onVideoSyncing(upToDateVideoInfo);
        }
      }
    }
  }

  // Andrew - each user sends info to this regularly so that people that join tv area have synced video info
  // to start their youtube player at. NOTE: The commented part is supposed to check everyone's current video
  // timestamp and if anyone is more than a couple seconds off from someone else then everyone is sent the 
  // same video info to sync up. This is commented out because when peple join/leave/skip, their youtube players
  // can send weird data like undefined or paused at 0 seconds which will set this off and then a waterfall of
  // improper syncing happens. Eventually we can come up with a better system to sync videos. Perhaps on the
  // frontend the youtube player can check its status first and only emit video info if the data is not 
  // undefined or if the player is not buffering or if the player is not "unstarted".
  shareVideoInfo(player: Player, videoInfo: YoutubeVideoInfo) {
    if (!videoInfo.timestamp || videoInfo.timestamp === 0) {return;}
    this._currentVideoInfoMap.set(player, videoInfo);
    //console.log(this._videActionTimeStamps)
    // console.log(`Player at ${videoInfo.timestamp}`);
    
    // if any of the videos are not within a couple seconds then update all to the same time
    // let earliestTime = this._currentVideoInfoMap.get(this._currentVideoInfoMap.keys().next().value)?.timestamp;
    // let latestTime = this._currentVideoInfoMap.get(this._currentVideoInfoMap.keys().next().value)?.timestamp;
    // if (earliestTime !== undefined && latestTime !== undefined) {
    //   this._currentVideoInfoMap.forEach((vidInfo) => {
    //     if (earliestTime !== undefined && latestTime !== undefined) {
    //       if (Math.abs(vidInfo.timestamp - earliestTime) > 2 || Math.abs(vidInfo.timestamp - latestTime) > 2) {
    //         this._listeners.forEach((listener) => listener.onVideoSyncing(vidInfo));
    //       }
    //       if (vidInfo.timestamp > latestTime) {
    //         latestTime = vidInfo.timestamp;
    //       }
    //       if (vidInfo.timestamp < earliestTime) {
    //         earliestTime = vidInfo.timestamp;
    //       }
    //     }
    //   })
    // }
  }

  // Andrew - remove listeners and most-recent video info associated with player after they leave tv area
  removeFromTVArea(playerToRemove: Player) {
    this._currentVideoInfoMap.delete(playerToRemove);
    this._listenersInTVAreaMap.delete(playerToRemove);
  }

  // Andrew - This is how the server chooses the video URL with the most votes. If ther eare no votes then a 
  // default video will be played.
  chooseNextVideo() {
    // Select video with most votes and send it out to all clients to start
    let maxVotes = 0;
    let maxVotedURL = 'https://www.youtube.com/watch?v=5kcdRBHM7kM'; // if there are no votes then default vid plays
    console.log(this._videoURLVotes)
    this._videoURLVotes.forEach((votes, vidURL) => {
      if (votes > maxVotes) {
        maxVotes = votes;
        maxVotedURL = vidURL;
      }
    })

    this._listeners.forEach((listener) => listener.onVideoSyncing({
      url: maxVotedURL.valueOf(),
      timestamp: 0,
      isPlaying: true
    }));

    // clear votes now for next round
    this._videoURLVotes = new Map<string, number>();
  }

  // Andrew - increase the number of votes for the video URL by 1 if it exists already, otherwise, set to 1.
  // I had to use JSON.stringify(videoURL) to convert the object with one value to just a string (this was such
  // a weird JS/TS thing that took me a while to find a solution for since the map's set() and get() functions
  // were not working propely when I simply used videoURL).
  voteForVideo(videoURL: string) {
    console.log(this._videoURLVotes);
    const stringVideoURL = JSON.stringify(videoURL);
    const firstSplit: string = stringVideoURL.substring(13, stringVideoURL.length - 2)
    let seenVid = false;
    this._videoURLVotes.forEach((numVotes, viddURL) => {
      if (viddURL == firstSplit) {
        seenVid = true;
        this._videoURLVotes.set(viddURL, numVotes + 1);
      }
    })
    if (!seenVid) {
      this._videoURLVotes.set(firstSplit, 1);
    }
  }
}
