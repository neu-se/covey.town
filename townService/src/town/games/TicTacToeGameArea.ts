import InvalidParametersError from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  InteractableCommand,
  InteractableCommandReturnType,
  InteractableType,
} from '../../types/CoveyTownSocket';
import GameArea from './GameArea';
import TicTacToeGame from './TicTacToeGame';

/**
 * A TicTacToeGameArea is a GameArea that hosts a TicTacToeGame.
 * @see TicTacToeGame
 * @see GameArea
 */
export default class TicTacToeGameArea extends GameArea<TicTacToeGame> {
  protected getType(): InteractableType {
    return 'TicTacToeArea';
  }

  private _stateUpdated() {
    if (this._game?.state.status === 'OVER') {
      // If we haven't yet recorded the outcome, do so now.
      if (!this._history.find(eachResult => eachResult.gameID === this._game?.id)) {
        const { x } = this._game;
        const { o } = this._game;
        const xName = `${x?.userName}`;
        const oName = `${o?.userName}`;
        this._history.push({
          gameID: this._game.id,
          scores: {
            [xName]: this._game.state.winner === this._game.state.x ? 1 : 0,
            [oName]: this._game.state.winner === this._game.state.o ? 1 : 0,
          },
        });
      }
    }
    this._emitAreaChanged();
  }

  /**
   * Handle a command from a player in this game area.
   * Supported commands:
   * - GameMove (applies a move to the game)
   * - JoinGame (joins the game, or creates a new one if none is in progress)
   * - LeaveGame (leaves the game)
   * @see InteractableCommand
   *
   * @param command command to handle
   * @param player player making the request
   * @returns response to the command, @see InteractableCommandResponse
   * @throws InvalidParametersError if the command is not supported or is invalid
   */
  public handleCommand<CommandType extends InteractableCommand>(
    command: CommandType,
    player: Player,
  ): InteractableCommandReturnType<CommandType> {
    if (command.type === 'GameMove') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError('No game in progress');
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError('Game ID mismatch');
      }
      game.applyMove({
        gameID: command.gameID,
        playerID: player.id,
        move: {
          ...command.move,
          gamePiece: player.id === game.state.x ? 'X' : 'O',
        },
      });
      return undefined as InteractableCommandReturnType<CommandType>;
    }
    else if (command.type === 'JoinGame') {
      let game = this._game;
      if (!game || game.state.status === 'OVER') {
        // No game in progress, make a new one
        game = new TicTacToeGame(this._stateUpdated.bind(this));
        this._game = game;
      }
      game.join(player);
      return { gameID: game.id } as InteractableCommandReturnType<CommandType>;
    }
    else if (command.type === 'LeaveGame') {
      const game = this._game;
      if (!game) {
        throw new InvalidParametersError('No game in progress');
      }
      if (this._game?.id !== command.gameID) {
        throw new InvalidParametersError('Game ID mismatch');
      }
      game.leave(player);
      return undefined as InteractableCommandReturnType<CommandType>;
    } else {
      throw new InvalidParametersError('Invalid command');
    }
  }
}
