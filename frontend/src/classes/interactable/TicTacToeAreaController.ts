import { GameArea, GameInstance, GameResult, GameStatus, TicTacToeGameState } from "../../types/CoveyTownSocket";
import PlayerController from "../PlayerController";
import GameAreaController, { GameEventTypes } from "./GameAreaController";

export type TicTacToeCell = 'X' | 'O' | undefined;
export type TicTacToeEvents = GameEventTypes & {
    boardChanged: (board: TicTacToeCell[][]) => void;
    turnChanged: (isOurTurn: boolean) => void;
}
export default class TicTacToeAreaController extends GameAreaController<TicTacToeGameState, TicTacToeEvents>{

    protected _board: TicTacToeCell[][] = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]];

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

    get winner(): PlayerController | undefined {
        const winner = this._model.game?.state.winner;
        if (winner) {
            return this.occupants.find(eachOccupant => eachOccupant.id === winner);
        }
        return undefined;
    }

    get whoseTurn(): PlayerController | undefined {
        const x = this.x;
        const o = this.o;
        if (!x || !o || this._model.game?.state.status !== 'IN_PROGRESS') {
            console.log('Returning undefined')
            return undefined;
        }
        if (this.moveCount % 2 === 0) {
            return x;
        } else if (this.moveCount % 2 === 1) {
            return o;
        }
        else {
            throw new Error('Invalid move count')
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

    protected _updateFrom(newModel: GameArea<TicTacToeGameState>): void {
        super._updateFrom(newModel);
        const newState = newModel.game;
        if (newState) {
            this._board = [[undefined, undefined, undefined], [undefined, undefined, undefined], [undefined, undefined, undefined]];
            newState.state.moves.forEach(move => {
                this._board[move.x][move.y] = move.gamePiece;
            });
            console.log(`BoardChagned, moves = ${this._model.game?.state.moves.length}`)
            this.emit('boardChanged', this._board);
        }
        const isOurTurn = this.whoseTurn?.id === this._townController.ourPlayer.id;
        console.log(`TurnChanged, isOurTurn = ${isOurTurn}`)
        this.emit('turnChanged', isOurTurn);
    }

    public async makeMove(row: integer, col: integer) {
        const instanceID = this._instanceID;
        if (!instanceID) {
            throw new Error('No game in progress');
        }
        console.log(`Making move ${row}, ${col}`);
        await this._townController.sendInteractableCommand(this.id, {
            type: 'GameMove',
            gameID: instanceID,
            move: {
                x: row,
                y: col,
            }
        });
    }

}