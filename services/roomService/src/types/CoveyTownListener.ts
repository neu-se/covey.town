import { ServerConversationArea } from '../client/TownsServiceClient';
import Player from './Player';

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

  /**
   * Called when a conversation is created or updated
   * @param conversation the conversation that is updated or created
   */
  onConversationUpdated(conversation: ServerConversationArea) : void;

  /**
   * Called when a conversation is destroyed
   * @param conversation the conversation that has been destroyed
   */
  onConversationDestroyed(conversation: ServerConversationArea): void;
}
