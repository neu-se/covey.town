import InvalidParametersError from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import { GameMove, TicTacToeGameState, TicTacToeMove } from '../../types/CoveyTownSocket';
import Game from './Game';

export default class TicTacToeGame extends Game<TicTacToeGameState, TicTacToeMove> {
  private _x?: Player;

  private _o?: Player;

  public constructor(emitAreaChanged: () => void) {
    super(
      {
        moves: [],
        status: 'WAITING_TO_START',
      },
      emitAreaChanged,
    );
  }

  private _checkForGameEnding(): boolean {
    // A game ends when there are 3 in a row
    const { moves } = this.state;
    const board = [
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
    ];
    for (const move of moves) {
      board[move.x][move.y] = move.gamePiece;
    }
    // Check for 3 in a row or column
    for (let i = 0; i < 3; i++) {
      if (board[i][0] !== '' && board[i][0] === board[i][1] && board[i][0] === board[i][2]) {
        this.state = {
          ...this.state,
          status: 'OVER',
          winner: board[i][0] === 'X' ? this.state.x : this.state.o,
        };
        return true;
      }
      if (board[0][i] !== '' && board[0][i] === board[1][i] && board[0][i] === board[2][i]) {
        this.state = {
          ...this.state,
          status: 'OVER',
          winner: board[0][i] === 'X' ? this.state.x : this.state.o,
        };
        return true;
      }
    }
    // Check for 3 in a diagonal
    if (board[0][0] !== '' && board[0][0] === board[1][1] && board[0][0] === board[2][2]) {
      this.state = {
        ...this.state,
        status: 'OVER',
        winner: board[0][0] === 'X' ? this.state.x : this.state.o,
      };
      return true;
    }
    // Check for no more moves
    if (moves.length === 9) {
      this.state = {
        ...this.state,
        status: 'OVER',
        winner: undefined,
      };
      return true;
    }
    return false;
  }

  private _validateMove(move: TicTacToeMove) {
    // A move is valid if it is in the board and the space is empty
    if (move.x < 0 || move.x > 2 || move.y < 0 || move.y > 2) {
      throw new InvalidParametersError('Move is out of bounds');
    }
    for (const m of this.state.moves) {
      if (m.x === move.x && m.y === move.y) {
        throw new InvalidParametersError('Move is not empty');
      }
    }
    // A move is only valid if it is the player's turn
    if (move.gamePiece === 'X' && this.state.moves.length % 2 === 1) {
      throw new InvalidParametersError('Not your turn');
    } else if (move.gamePiece === 'O' && this.state.moves.length % 2 === 0) {
      throw new InvalidParametersError('Not your turn');
    }
    // A move is valid only if game is in progress
    if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError('Game is not in progress');
    }
  }

  private _applyMove(move: TicTacToeMove): void {
    this.state = {
      ...this.state,
      moves: [...this.state.moves, move],
    };
    this._checkForGameEnding();
  }

  public applyMove(move: GameMove<TicTacToeMove>): void {
    this._validateMove(move.move);
    if (move.playerID === this.state.x) {
      this._applyMove({
        gamePiece: 'X',
        x: move.move.x,
        y: move.move.y,
      });
    } else if (move.playerID === this.state.o) {
      this._applyMove({
        gamePiece: 'O',
        x: move.move.x,
        y: move.move.y,
      });
    } else {
      throw new InvalidParametersError('Player is not in this game');
    }
  }

  public _join(player: Player): void {
    if (this.state.x === player.id || this.state.o === player.id) {
      throw new InvalidParametersError('Player is already in the game');
    }
    if (!this.state.x) {
      this._players.push(player);
      this.state = {
        ...this.state,
        x: player.id,
      };
      this._x = player;
    } else if (!this.state.o) {
      this._players.push(player);
      this.state = {
        ...this.state,
        o: player.id,
      };
      this._o = player;
    } else {
      throw new InvalidParametersError('Game is full');
    }
    if (this.state.x && this.state.o) {
      this.state = {
        ...this.state,
        status: 'IN_PROGRESS',
      };
    }
  }

  protected _leave(player: Player): void {
    // Handles case where the game has not started yet
    if (this.state.x === undefined || this.state.o === undefined) {
      this.state = {
        moves: [],
        status: 'WAITING_TO_START',
      };
    }
    if (this.state.x === player.id) {
      this.state = {
        ...this.state,
        status: 'OVER',
        winner: this.state.o,
      };
    } else if (this.state.o === player.id) {
      this.state = {
        ...this.state,
        status: 'OVER',
        winner: this.state.x,
      };
    }
  }

  get x() {
    return this._x;
  }

  get o() {
    return this._o;
  }
}
