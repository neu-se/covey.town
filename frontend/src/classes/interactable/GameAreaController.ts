import _ from "lodash";
import { GameArea, GameInstance, GameInstanceID, GameResult, GameState, GameStatus, Interactable, InteractableID, TicTacToeGameState } from "../../types/CoveyTownSocket";
import PlayerController from "../PlayerController";
import TownController from "../TownController";
import InteractableAreaController from "./InteractableAreaController";

export type GameEventTypes = {
    gameStart: () => void;
    gameUpdated: () => void;
    gameEnd: () => void;
    playersChange: (newPlayers: PlayerController[]) => void;
}
// FALL23 GameArea New
export default abstract class GameAreaController<State extends GameState, EventTypes> extends InteractableAreaController<
    EventTypes & GameEventTypes, GameArea<State>>{

    protected _instanceID?: GameInstanceID;
    protected _townController: TownController;
    protected _model: GameArea<State>;
    protected _players: PlayerController[] = [];


    constructor(id: InteractableID, gameArea: GameArea<State>, townController: TownController) {
        super(id);
        this._model = gameArea;
        this._townController = townController;
    }

    get history(): GameResult[] {
        return this._model.history;
    }

    get players(): PlayerController[] {
        return this._players;
    }

    get currentGame(): GameInstance<State> | undefined {
        return this._model.game;
    }

    public async joinGame() {
        const { gameID } = await this._townController.sendInteractableCommand(this.id, {
            type: 'JoinGame'
        });
        this._instanceID = gameID;
    }

    protected _updateFrom(newModel: GameArea<State>): void {
        const gameEnding = this._model.game?.state.status === 'IN_PROGRESS' &&
            newModel.game?.state.status === 'OVER';
        const newPlayers = newModel.game?.players.map(playerID => this._townController.getPlayer(playerID));
        if (!newPlayers && this._players.length > 0) {
            this._players = [];
            // @ts-ignore
            this.emit('playersChange', []);
        }
        if (this._players.length != newModel.game?.players.length || _.xor(newPlayers, this._players).length > 0) {
            this._players = newPlayers ?? [];
            // @ts-ignore
            this.emit('playersChange', newPlayers);
        }
        this._model = newModel;
        // @ts-ignore
        this.emit('gameUpdated');
        this._instanceID = newModel.game?.id ?? this._instanceID;
        if (gameEnding) {
            //TODO figure out types?
            //@ts-ignore
            this.emit('gameEnd');
        }
    }

    toInteractableAreaModel(): GameArea<State> {
        return this._model;
    }

}