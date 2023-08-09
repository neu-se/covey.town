import { nanoid } from "nanoid";
import Player from "../../lib/Player";
import { GameInstance, GameInstanceID, GameMove, GameResult, GameState } from "../../types/CoveyTownSocket";

export default abstract class Game<StateType extends GameState, MoveType> {
    private _state: Readonly<StateType>;
    private _emitAreaChanged: () => void
    public readonly id: GameInstanceID;
    protected _result?: GameResult;
    protected _players: Player[] = [];

    public constructor(initialState: StateType, emitAreaChanged: () => void) {
        this.id = nanoid() as GameInstanceID;
        this._state = initialState;
        this._emitAreaChanged = emitAreaChanged;
    }

    public get state(){
        return this._state;
    }

    protected set state(newState: StateType){
        this._state = newState;
        this._emitAreaChanged();
    }

    public abstract applyMove(move: GameMove<MoveType>): void;

    protected abstract _join(player: Player): void;
    protected abstract _leave(player: Player): void;

    public join(player: Player) : void {
        this._join(player);
        console.log(`Player ${player.id} joined game ${this.id}`)
    }

    public leave(player: Player) : void {
        this._players = this._players.filter(p => p.id !== player.id);
        this._leave(player);
        console.log(`Player ${player.id} left game ${this.id}`)
        this._emitAreaChanged(); //Tricky - becuase we are updating the players list
    }

    public toModel(): GameInstance<StateType> {
        return {
            state: this._state,
            id: this.id,
            result: this._result,
            players: this._players.map(player => player.id),
        }
    }
}