
/**
 * A listener for player-related events in each town
 */
export default interface TTTListener {
  /**
   * Called when a player join a TTT game
   * @param newplayer the player joining game
   */
  joinGame(playerID: string): void;

  /**
   * Called when a board is updated
   * @param updatedBoard the updated board
   */
  updatedBoard(gameBoard: Number[][]): void;


  /**
   * Who's turn is it in current TTT game
   */
  currentPlayer(curPlayer: string): void;

  /**
   * Called when a game has ended, causing all players to disconnect
   */
  gameEnded(): void;


}
