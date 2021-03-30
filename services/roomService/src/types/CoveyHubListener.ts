import Player from './Player';

/**
 * A listener for player-related events in each Hub
 */
export default interface CoveyHubListener {
  /**
   * Called when a player joins a Hub
   * @param newPlayer the new player
   */
  onPlayerJoined(newPlayer: Player): void;

  /**
   * Called when a player's location changes
   * @param movedPlayer the player that moved
   */
  onPlayerMoved(movedPlayer: Player): void;

  /**
   * Called when a player disconnects from the Hub
   * @param removedPlayer the player that disconnected
   */
  onPlayerDisconnected(removedPlayer: Player): void;

  /**
   * Called when a Hub is destroyed, causing all players to disconnect
   */
  onHubDestroyed(): void;
}
