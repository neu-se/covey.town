import { YoutubeVideoInfo } from '../CoveyTypes';
import Player from './Player';
import { YTVideo } from './YTVideo';

/**
 * A listener for player-related events in each town
 */
export default interface CoveyTownListener {
  /**
   * Called when a player joins a town
   * @param newPlayer the new player
   */
  onPlayerJoined(newPlayer: Player): void;

  /**
   * Called when a player's location changes
   * @param movedPlayer the player that moved
   */
  onPlayerMoved(movedPlayer: Player): void;

  /**
   * Called when a player disconnects from the town
   * @param removedPlayer the player that disconnected
   */
  onPlayerDisconnected(removedPlayer: Player): void;

  /**
   * Called when a town is destroyed, causing all players to disconnect
   */
  onTownDestroyed(): void;

  // Andrew - called when another client paused and this client should pause their video
  onPlayerPaused(): void;

  // Andrew - called when another client played and this client should play their video
  onPlayerPlayed(): void;

  // Andrew - called when this player should sync their youtube player up with whatever the most recent video is
  onVideoSyncing(videoInfo: YoutubeVideoInfo): void;

  // Andrew - called when client should have voting button enabled when new video starts
  onEnableVoting(): void;

  // Andrew - called when client should disable play/pause buttons before next time it joins tv sream
  onDisablePlayPause(): void;

  onUpdatingNextVideoOptions(videoList: YTVideo[]): void;

  onResetVideoOptions(): void;

  onDisplayVotingWidget(): void;
}
