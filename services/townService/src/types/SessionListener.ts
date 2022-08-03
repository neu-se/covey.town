import { ChatMessage } from '../CoveyTypes';

/**
 * A listener for player-related events in each town
 */
export default interface SessionListener {

  /**
   * Called when a chat message is received from a user
   * @param message the new chat message
   */
  onChatMessage(message: ChatMessage): void;
}
