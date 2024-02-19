import _ from 'lodash';
import {
  ConnectFourColIndex,
  ConnectFourColor,
  ConnectFourGameState,
  ConnectFourMove,
  ConnectFourRowIndex,
  GameArea,
  GameStatus,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, {
  GameEventTypes,
  NO_GAME_IN_PROGRESS_ERROR,
  NO_GAME_STARTABLE,
  PLAYER_NOT_IN_GAME_ERROR,
} from './GameAreaController';

export type ConnectFourCell = ConnectFourColor | undefined;
export type ConnectFourEvents = GameEventTypes & {
  boardChanged: (board: ConnectFourCell[][]) => void;
  turnChanged: (isOurTurn: boolean) => void;
};
export const CONNECT_FOUR_ROWS = 6;
export const CONNECT_FOUR_COLS = 7;
export const COLUMN_FULL_MESSAGE = 'The column is full';

function createEmptyBoard(): ConnectFourCell[][] {
  const board = new Array(CONNECT_FOUR_ROWS);
  for (let i = 0; i < CONNECT_FOUR_ROWS; i++) {
    board[i] = new Array(CONNECT_FOUR_COLS).fill(undefined);
  }
  return board;
}

/**
 * This class is responsible for managing the state of the Connect Four game, and for sending commands to the server
 */
export default class ConnectFourAreaController extends GameAreaController<
  ConnectFourGameState,
  ConnectFourEvents
> {
  protected _board: ConnectFourCell[][] = createEmptyBoard();

  /**
   * Returns the current state of the board.
   *
   * The board is a 6x7 array of ConnectFourCell, which is either 'Red', 'Yellow', or undefined.
   *
   * The 2-dimensional array is indexed by row and then column, so board[0][0] is the top-left cell,
   */
  get board(): ConnectFourCell[][] {
    return this._board;
  }

  /**
   * Returns the player with the 'Red' game piece, if there is one, or undefined otherwise
   */
  get red(): PlayerController | undefined {
    const red = this._model.game?.state.red;
    if (red) {
      return this.occupants.find(eachOccupant => eachOccupant.id === red);
    }
    return undefined;
  }

  /**
   * Returns the player with the 'Yellow' game piece, if there is one, or undefined otherwise
   */
  get yellow(): PlayerController | undefined {
    const yellow = this._model.game?.state.yellow;
    if (yellow) {
      return this.occupants.find(eachOccupant => eachOccupant.id === yellow);
    }
    return undefined;
  }

  /**
   * Returns the player who won the game, if there is one, or undefined otherwise
   */
  get winner(): PlayerController | undefined {
    const winner = this._model.game?.state.winner;
    if (winner) {
      return this.occupants.find(eachOccupant => eachOccupant.id === winner);
    }
    return undefined;
  }

  /**
   * Returns the number of moves that have been made in the game
   */
  get moveCount(): number {
    return this._model.game?.state.moves.length || 0;
  }

  /**
   * Returns true if it is our turn to make a move, false otherwise
   */
  get isOurTurn(): boolean {
    return this.whoseTurn?.id === this._townController.ourPlayer.id;
  }

  /**
   * Returns true if the current player is in the game, false otherwise
   */
  get isPlayer(): boolean {
    return this._model.game?.players.includes(this._townController.ourPlayer.id) ?? false;
  }

  /**
   * Returns the color of the current player's game piece
   * @throws an error with message PLAYER_NOT_IN_GAME_ERROR if the current player is not in the game
   */
  get gamePiece(): ConnectFourColor {
    if (this.red?.id === this._townController.ourPlayer.id) {
      return 'Red';
    } else if (this.yellow?.id === this._townController.ourPlayer.id) {
      return 'Yellow';
    }
    throw new Error(PLAYER_NOT_IN_GAME_ERROR);
  }

  /**
   * Returns the status of the game
   * If there is no game, returns 'WAITING_FOR_PLAYERS'
   */
  get status(): GameStatus {
    const status = this._model.game?.state.status;
    if (!status) {
      return 'WAITING_FOR_PLAYERS';
    }
    return status;
  }

  /**
   * Returns the player whose turn it is, if the game is in progress
   * Returns undefined if the game is not in progress
   *
   * Follows the same logic as the backend, respecting the firstPlayer field of the gameState
   */
  get whoseTurn(): PlayerController | undefined {
    const { red, yellow } = this;
    if (!red || !yellow || this._model.game?.state.status !== 'IN_PROGRESS') {
      return undefined;
    }
    const firstPlayer = this._model.game?.state.firstPlayer;
    if (firstPlayer === 'Red') {
      if (this.moveCount % 2 === 0) {
        return red;
      }
      return yellow;
    } else {
      if (this.moveCount % 2 === 0) {
        return yellow;
      }
      return red;
    }
  }

  /**
   * Returns true if the game is empty - no players AND no occupants in the area
   *
   */
  isEmpty(): boolean {
    return !this.red && !this.yellow && this.occupants.length === 0;
  }

  /**
   * Returns true if the game is not empty and the game is not waiting for players
   */
  public isActive(): boolean {
    return !this.isEmpty() && this.status !== 'WAITING_FOR_PLAYERS';
  }

  /**
   * Updates the internal state of this ConnectFourAreaController based on the new model.
   *
   * Calls super._updateFrom, which updates the occupants of this game area and other
   * common properties (including this._model)
   *
   * If the board has changed, emits a boardChanged event with the new board.
   * If the board has not changed, does not emit a boardChanged event.
   *
   * If the turn has changed, emits a turnChanged event with the new turn (true if our turn, false otherwise)
   * If the turn has not changed, does not emit a turnChanged event.
   */
  protected _updateFrom(newModel: GameArea<ConnectFourGameState>): void {
    const wasOurTurn = this.isOurTurn;
    super._updateFrom(newModel);
    const newGame = newModel.game;
    if (newGame) {
      const newBoard = createEmptyBoard();
      newGame.state.moves.forEach(move => {
        newBoard[move.row][move.col] = move.gamePiece;
      });
      if (!_.isEqual(newBoard, this._board)) {
        this._board = newBoard;
        this.emit('boardChanged', this._board);
      }
    }
    const isOurTurn = this.isOurTurn;
    if (wasOurTurn !== isOurTurn) this.emit('turnChanged', isOurTurn);
  }

  /**
   * Sends a request to the server to start the game.
   *
   * If the game is not in the WAITING_TO_START state, throws an error.
   *
   * @throws an error with message NO_GAME_STARTABLE if there is no game waiting to start
   */
  public async startGame(): Promise<void> {
    const instanceID = this._instanceID;
    if (!instanceID || this._model.game?.state.status !== 'WAITING_TO_START') {
      throw new Error(NO_GAME_STARTABLE);
    }
    await this._townController.sendInteractableCommand(this.id, {
      gameID: instanceID,
      type: 'StartGame',
    });
  }

  /**
   * Sends a request to the server to place the current player's game piece in the given column.
   * Calculates the row to place the game piece in based on the current state of the board.
   * Does not check if the move is valid.
   *
   * @throws an error with message NO_GAME_IN_PROGRESS_ERROR if there is no game in progress
   * @throws an error with message COLUMN_FULL_MESSAGE if the column is full
   *
   * @param col Column to place the game piece in
   */
  public async makeMove(col: ConnectFourColIndex): Promise<void> {
    const instanceID = this._instanceID;
    if (!instanceID || this._model.game?.state.status !== 'IN_PROGRESS') {
      throw new Error(NO_GAME_IN_PROGRESS_ERROR);
    }

    const gamePiece = this.gamePiece;
    //Find the row to place the game piece based on our current board
    let row = -1;
    for (let i = this.board.length - 1; i >= 0; i--) {
      if (!this.board[i][col]) {
        row = i;
        break;
      }
    }
    if (row == -1) {
      throw new Error(COLUMN_FULL_MESSAGE);
    }
    const move: ConnectFourMove = {
      gamePiece,
      col,
      row: row as ConnectFourRowIndex,
    };
    await this._townController.sendInteractableCommand(this.id, {
      type: 'GameMove',
      gameID: instanceID,
      move,
    });
  }
}
