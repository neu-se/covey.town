import { GameArea, GameStatus, TicTacToeGameState } from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController from './GameAreaController';

export type TicTacToeCell = 'X' | 'O' | undefined;
export type TicTacToeEvents = {
  boardChanged: (board: TicTacToeCell[][]) => void;
  turnChanged: (isOurTurn: boolean) => void;
};

/**
 * This class is responsible for managing the state of the Tic Tac Toe game, and for sending commands to the server
 */
export default class TicTacToeAreaController extends GameAreaController<
  TicTacToeGameState,
  TicTacToeEvents
> {
  protected _board: TicTacToeCell[][] = [
    [undefined, undefined, undefined],
    [undefined, undefined, undefined],
    [undefined, undefined, undefined],
  ];

  get board(): TicTacToeCell[][] {
    return this._board;
  }

  get x(): PlayerController | undefined {
    const x = this._model.game?.state.x;
    if (x) {
      return this.occupants.find(eachOccupant => eachOccupant.id === x);
    }
    return undefined;
  }

  get o(): PlayerController | undefined {
    const o = this._model.game?.state.o;
    if (o) {
      return this.occupants.find(eachOccupant => eachOccupant.id === o);
    }
    return undefined;
  }

  get moveCount(): number {
    return this._model.game?.state.moves.length || 0;
  }

  /**
   * Returns the winner of the game, if there is one
   */
  get winner(): PlayerController | undefined {
    const winner = this._model.game?.state.winner;
    if (winner) {
      return this.occupants.find(eachOccupant => eachOccupant.id === winner);
    }
    return undefined;
  }

  /**
   * Returns the player whose turn it is, if the game is in progress
   */
  get whoseTurn(): PlayerController | undefined {
    const x = this.x;
    const o = this.o;
    if (!x || !o || this._model.game?.state.status !== 'IN_PROGRESS') {
      return undefined;
    }
    if (this.moveCount % 2 === 0) {
      return x;
    } else if (this.moveCount % 2 === 1) {
      return o;
    } else {
      throw new Error('Invalid move count');
    }
  }

  get isPlayer(): boolean {
    return this._model.game?.players.includes(this._townController.ourPlayer.id) || false;
  }

  get status(): GameStatus {
    const status = this._model.game?.state.status;
    if (!status) {
      return 'WAITING_TO_START';
    }
    return status;
  }

  public isActive(): boolean {
    return this._model.game?.state.status === 'IN_PROGRESS';
  }

  /**
   * Updates the internal state of this TicTacToeAreaController to match the new model
   * @param newModel
   */
  protected _updateFrom(newModel: GameArea<TicTacToeGameState>): void {
    super._updateFrom(newModel);
    const newState = newModel.game;
    if (newState) {
      this._board = [
        [undefined, undefined, undefined],
        [undefined, undefined, undefined],
        [undefined, undefined, undefined],
      ];
      newState.state.moves.forEach(move => {
        this._board[move.row][move.col] = move.gamePiece;
      });
      this.emit('boardChanged', this._board);
    }
    const isOurTurn = this.whoseTurn?.id === this._townController.ourPlayer.id;
    this.emit('turnChanged', isOurTurn);
  }

  /**
   * Sends a request to the server to make a move in the game
   *
   * @param row Row of the move
   * @param col Column of the move
   */
  public async makeMove(row: integer, col: integer) {
    const instanceID = this._instanceID;
    if (!instanceID) {
      throw new Error('No game in progress');
    }
    await this._townController.sendInteractableCommand(this.id, {
      type: 'GameMove',
      gameID: instanceID,
      move: {
        row,
        col,
      },
    });
  }
}
