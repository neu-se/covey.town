import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  BOARD_POSITION_NOT_EMPTY_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  MOVE_OUT_OF_BOUNDS_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import { GameMove, TicTacToeGameState, TicTacToeMove } from '../../types/CoveyTownSocket';
import Game from './Game';

/**
 * A TicTacToeGame is a Game that implements the rules of Tic Tac Toe.
 * @see https://en.wikipedia.org/wiki/Tic-tac-toe
 */
export default class TicTacToeGame extends Game<TicTacToeGameState, TicTacToeMove> {
  public constructor() {
    super({
      moves: [],
      status: 'WAITING_TO_START',
    });
  }

  private get _board() {
    const { moves } = this.state;
    const board = [
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
    ];
    for (const move of moves) {
      board[move.row][move.col] = move.gamePiece;
    }
    return board;
  }

  private _checkForGameEnding() {
    const board = this._board;
    // A game ends when there are 3 in a row
    // Check for 3 in a row or column
    for (let i = 0; i < 3; i++) {
      if (board[i][0] !== '' && board[i][0] === board[i][1] && board[i][0] === board[i][2]) {
        this.state = {
          ...this.state,
          status: 'OVER',
          winner: board[i][0] === 'X' ? this.state.x : this.state.o,
        };
        return;
      }
      if (board[0][i] !== '' && board[0][i] === board[1][i] && board[0][i] === board[2][i]) {
        this.state = {
          ...this.state,
          status: 'OVER',
          winner: board[0][i] === 'X' ? this.state.x : this.state.o,
        };
        return;
      }
    }
    // Check for 3 in a diagonal
    if (board[0][0] !== '' && board[0][0] === board[1][1] && board[0][0] === board[2][2]) {
      this.state = {
        ...this.state,
        status: 'OVER',
        winner: board[0][0] === 'X' ? this.state.x : this.state.o,
      };
      return;
    }
    // Check for no more moves
    if (this.state.moves.length === 9) {
      this.state = {
        ...this.state,
        status: 'OVER',
        winner: undefined,
      };
    }
  }

  private _validateMove(move: TicTacToeMove) {
    // A move is valid if it is in the board and the space is empty
    if (move.col < 0 || move.col > 2 || move.row < 0 || move.row > 2) {
      throw new InvalidParametersError(MOVE_OUT_OF_BOUNDS_MESSAGE);
    }
    for (const m of this.state.moves) {
      if (m.col === move.col && m.row === move.row) {
        throw new InvalidParametersError(BOARD_POSITION_NOT_EMPTY_MESSAGE);
      }
    }

    // A move is only valid if it is the player's turn
    if (move.gamePiece === 'X' && this.state.moves.length % 2 === 1) {
      throw new InvalidParametersError(MOVE_NOT_YOUR_TURN_MESSAGE);
    } else if (move.gamePiece === 'O' && this.state.moves.length % 2 === 0) {
      throw new InvalidParametersError(MOVE_NOT_YOUR_TURN_MESSAGE);
    }
    // A move is valid only if game is in progress
    if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
  }

  private _applyMove(move: TicTacToeMove): void {
    this.state = {
      ...this.state,
      moves: [...this.state.moves, move],
    };
    this._checkForGameEnding();
  }

  /**
   * Applies a player's move to the game.
   * Updates the game's state to reflect the move.
   * If the move ends the game, updates the game's state to reflect the end of the game.
   *
   * @param move The move to apply to the game
   * @throws InvalidParametersError if the move is invalid
   */
  public applyMove(move: GameMove<TicTacToeMove>): void {
    let gamePiece: 'X' | 'O';
    if (move.playerID === this.state.x) {
      gamePiece = 'X';
    } else {
      gamePiece = 'O';
    }
    const cleanMove = {
      gamePiece,
      col: move.move.col,
      row: move.move.row,
    };
    this._validateMove(cleanMove);
    this._applyMove(cleanMove);
  }

  /**
   * Adds a player to the game.
   * Updates the game's state to reflect the new player.
   *
   * @param player The player to join the game
   * @throws InvalidParametersError if the player is already in the game or the game is full
   */
  public _join(player: Player): void {
    if (this.state.x === player.id || this.state.o === player.id) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    if (!this.state.x) {
      this._players.push(player);
      this.state = {
        ...this.state,
        x: player.id,
      };
    } else if (!this.state.o) {
      this._players.push(player);
      this.state = {
        ...this.state,
        o: player.id,
      };
    } else {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }
    if (this.state.x && this.state.o) {
      this.state = {
        ...this.state,
        status: 'IN_PROGRESS',
      };
    }
  }

  /**
   * Removes a player from the game.
   * Updates the game's state to reflect the player leaving.
   * If the game has already started, updates the game's state to reflect the end of the game.
   * If the game has not started yet, updates the game's state to reflect the game still waiting to start.
   *
   * @param player The player to remove from the game
   */
  protected _leave(player: Player): void {
    if (this.state.x !== player.id && this.state.o !== player.id) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    // Handles case where the game has not started yet
    if (this.state.o === undefined) {
      this.state = {
        moves: [],
        status: 'WAITING_TO_START',
      };
      return;
    }
    if (this.state.x === player.id) {
      this.state = {
        ...this.state,
        status: 'OVER',
        winner: this.state.o,
      };
    } else {
      this.state = {
        ...this.state,
        status: 'OVER',
        winner: this.state.x,
      };
    }
  }
}
