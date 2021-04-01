import GlobalChatMessage from './GlobalChatMessage';
import Player from './Player';
import PrivateChatMessage from './PrivateChatMessage';

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
   * Called when a player sends a private message in the town
   * @param sender the player sending the message
   * @param receiver the player receiving the message
   * @param message the message being sent
   */
  onPrivateMessage(sender: Player, receiver: Player, message: PrivateChatMessage): void;

  /**
   * Called when a player sends a global message in the town
   * @param sender the player sending the message
   * @param message the message being sent
   */
  onGlobalMessage(sender: Player, message: GlobalChatMessage): void;

  /**
   * Called when a town is destroyed, causing all players to disconnect
   */
  onTownDestroyed(): void;
}
