/**
 * Interface for tictactoe game, used by towns
 */
export default interface ITicTacToe {

  /**
  starts a tictactoe game,resetting board and accepting moves
  @param playerID: playerID of player making call to start game
  **/
  startGame(playerID: string): string;

  /**
  returns tictactoe whether game is currently active. False if game has not started,
  or if game is over( has been won/board is full)
  **/
  isgameActive(): boolean;

  /**
  returns playerId of player's whose current turn it is in tictactoe
  **/
  currentPlayer(): string;

  /**
  if there is a winner of the previous tictactoe game it will return the winner's
  playerID, else it throws an error
  **/
  getWinner(): string;

  /**
  returns array with gameBoard with 1's inplace of x and 2's in place of o
  **/
  getBoard(): number[][];

  /**
  adds a move to the gameboard.
  Error if given values are invalid,the spot is not empty, or if game is not gameActive
  @param x: number between 0-2, inclusive for row in which to place move
  @param y: number between 0-2, inclusive for col in which to place move

  **/
  makeMove(x:number, y:number): void;

  /**
  sets game status to inactive, preventing further moves until game is restarted
  **/
  endGame(): void;

  }
