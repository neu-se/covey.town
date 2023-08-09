import Player from "../../lib/Player";
import { GameResult, GameState, GameArea as GameAreaModel, TownEmitter, BoundingBox, InteractableType, GameInstance } from "../../types/CoveyTownSocket";
import Game from "./Game";
import InteractableArea from "../InteractableArea";

export default abstract class GameArea<GameType extends Game<any, any>> extends InteractableArea {
    protected _game?: GameType;
    protected _history: GameResult[] = [];

    public toModel(): GameAreaModel<GameType['state']> {
        return {
            id: this.id,
            game: this._game?.toModel(),
            history: this._history,
            occupants: this.occupantsByID,
            type: this.getType()
        }
    }

    protected abstract getType(): InteractableType;

    public remove(player: Player): void {
        if(this._game){
            console.log(`Removing player ${player.id} from game ${this._game.id}`)
            this._game.leave(player);
        }
        super.remove(player);
    }
}