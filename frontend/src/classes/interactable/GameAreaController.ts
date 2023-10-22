import _ from 'lodash';
import {
  GameArea,
  GameInstanceID,
  GameResult,
  GameState,
  InteractableID,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TownController from '../TownController';
import InteractableAreaController, { BaseInteractableEventMap } from './InteractableAreaController';

export type GameEventTypes = BaseInteractableEventMap & {
  gameStart: () => void;
  gameUpdated: () => void;
  gameEnd: () => void;
  playersChange: (newPlayers: PlayerController[]) => void;
};

/**
 * This class is the base class for all game controllers. It is responsible for managing the
 * state of the game, and for sending commands to the server to update the state of the game.
 * It is also responsible for notifying the UI when the state of the game changes, by emitting events.
 */
export default abstract class GameAreaController<
  State extends GameState,
  EventTypes extends GameEventTypes,
> extends InteractableAreaController<EventTypes, GameArea<State>> {
  protected _instanceID?: GameInstanceID;

  protected _townController: TownController;

  protected _model: GameArea<State>;

  protected _players: PlayerController[] = [];

  constructor(id: InteractableID, gameArea: GameArea<State>, townController: TownController) {
    super(id);
    this._model = gameArea;
    this._townController = townController;

    const game = gameArea.game;
    if (game && game.players)
      this._players = game.players.map(playerID => this._townController.getPlayer(playerID));
  }

  get history(): GameResult[] {
    return this._model.history;
  }

  get players(): PlayerController[] {
    return this._players;
  }

  public get observers(): PlayerController[] {
    return this.occupants.filter(eachOccupant => !this._players.includes(eachOccupant));
  }

  /**
   * Sends a request to the server to join the current game in the game area, or create a new one if there is no game in progress.
   *
   * @throws An error if the server rejects the request to join the game.
   */
  public async joinGame() {
    const { gameID } = await this._townController.sendInteractableCommand(this.id, {
      type: 'JoinGame',
    });
    this._instanceID = gameID;
  }

  /**
   * Sends a request to the server to leave the current game in the game area.
   */
  public async leaveGame() {
    const instanceID = this._instanceID;
    if (instanceID) {
      await this._townController.sendInteractableCommand(this.id, {
        type: 'LeaveGame',
        gameID: instanceID,
      });
    }
  }

  protected _updateFrom(newModel: GameArea<State>): void {
    const gameEnding =
      this._model.game?.state.status === 'IN_PROGRESS' && newModel.game?.state.status === 'OVER';
    const newPlayers =
      newModel.game?.players.map(playerID => this._townController.getPlayer(playerID)) ?? [];
    if (!newPlayers && this._players.length > 0) {
      this._players = [];
      //TODO - Bounty for figuring out how to make the types work here
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.emit('playersChange', []);
    }
    if (
      this._players.length != newModel.game?.players.length ||
      _.xor(newPlayers, this._players).length > 0
    ) {
      this._players = newPlayers;
      //TODO - Bounty for figuring out how to make the types work here
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.emit('playersChange', newPlayers);
    }
    this._model = newModel;
    //TODO - Bounty for figuring out how to make the types work here
    //eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.emit('gameUpdated');
    this._instanceID = newModel.game?.id ?? this._instanceID;
    if (gameEnding) {
      //TODO - Bounty for figuring out how to make the types work here
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.emit('gameEnd');
    }
  }

  toInteractableAreaModel(): GameArea<State> {
    return this._model;
  }
}
