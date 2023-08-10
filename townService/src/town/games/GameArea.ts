import Player from '../../lib/Player';
import {
  GameArea as GameAreaModel,
  GameResult,
  GameState,
  InteractableType,
} from '../../types/CoveyTownSocket';
import InteractableArea from '../InteractableArea';
import Game from './Game';

/**
 * A GameArea is an InteractableArea on the map that can host a game.
 * At any given point in time, there is at most one game in progress in a GameArea.
 */
export default abstract class GameArea<
  GameType extends Game<GameState, unknown>,
> extends InteractableArea {
  protected _game?: GameType;

  protected _history: GameResult[] = [];

  public toModel(): GameAreaModel<GameType['state']> {
    return {
      id: this.id,
      game: this._game?.toModel(),
      history: this._history,
      occupants: this.occupantsByID,
      type: this.getType(),
    };
  }

  protected abstract getType(): InteractableType;

  public remove(player: Player): void {
    if (this._game) {
      this._game.leave(player);
    }
    super.remove(player);
  }
}
