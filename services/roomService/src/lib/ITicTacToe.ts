/**
 * The video calling component of Covey.Town must implement this server interface,
 * which is used to authorize a client to connect to a video room.
 */
export default interface ITicTacToe {
  /**
   * Issue a secret token on behalf of the video service that the client will be able to use
   * to connect to the video room specified.
   *
   * @param coveyTownID The town that the client should be able to connect to
   * @param clientIdentity The identity of the client; the video service will map a client
   *                      that connects with the returned token back to this client identifier
   */
  getTokenForTown(coveyTownID: string, clientIdentity: string): Promise<string>;

  /**
  starts a tictactoe game,resetting board and accepting moves
  @param player1: playerID of starting player; x
  @param player2: playerID of second player; o

  **/
  startGame(player1: string, player2: string): void {
  }

  /**
  returns tictactoe whether game is currently active. False if game has not started,
  or if game is over( has been won/board is full)
  **/
  get isgameActive(): boolean {
  }

  /**
  returns playerId of player's whose current turn it is in tictactoe
  **/
  get currentPlayer(): string{
  }

  /**
  if there is a winner of the previous tictactoe game it will return the winner's
  playerID, else it throws an error
  **/
  getWinner(): string {}

  /**
  returns array with gameBoard with 1's inplace of x and 2's in place of o
  **/
  getBoard(): number[][] {
    return this.gameBoard;
  }

  /**
  adds a move to the gameboard.
  Error if given values are invalid,the spot is not empty, or if game is not gameActive
  @param x: number between 0-2, inclusive for row in which to place move
  @param y: number between 0-2, inclusive for col in which to place move

  **/
  makeMove(x:number, y:number): void {}
  }






  }


}
