import GameArea from "./GameArea";
import Player from "../../lib/Player";
import { InteractableCommand, InteractableType, TicTacToeGameState, TicTacToeMove } from "../../types/CoveyTownSocket";
import { InteractableCommandError } from "../InteractableArea";
import TicTacToeGame from "./TicTacToeGame";

export default class TicTacToeGameArea extends GameArea<TicTacToeGame> {

    protected getType(): InteractableType {
        return 'TicTacToeArea';
    }

    private _stateUpdated(){
        if(this._game?.state.status === 'OVER'){
            // If we haven't yet recorded the outcome, do so now.
            if(!this._history.find(eachResult => eachResult.gameID === this._game?.id)){
                const x = this._game.x;
                const o = this._game.o;
                const xName = `${x?.userName}`;
                const oName = `${o?.userName}`;
                this._history.push({
                    gameID: this._game.id,
                    scores: {
                        [xName]: this._game.state.winner === this._game.state.x ? 1 : 0,
                        [oName]: this._game.state.winner === this._game.state.o ? 1 : 0,
                    }
                });
            }
        }
        this._emitAreaChanged();
    }

    public handleCommand(command: InteractableCommand, player: Player) {
        if (command.type === 'GameMove') {
            const game = this._game;
            if (!game) {
                throw new InteractableCommandError('No game in progress');
            }
            if (this._game?.id !== command.gameID) {
                throw new InteractableCommandError('Game ID mismatch');
            }
            game.applyMove({
                gameID: command.gameID,
                playerID: player.id,
                move: {
                    ...command.move,
                    gamePiece: player.id === game.state.x ? 'X' : 'O'
                }
            });
            return;
        } else if (command.type === 'JoinGame') {
            let game = this._game;
            if (!game || game.state.status === 'OVER') {
                // No game in progress, make a new one
                game = new TicTacToeGame(this._stateUpdated.bind(this));
                console.log(`Created new game ${game.id}`);
                this._game = game;
            }
            game.join(player);
            return { gameID: game.id };
        } else if (command.type === 'LeaveGame') {
            const game = this._game;
            if (!game) {
                throw new InteractableCommandError('No game in progress');
            }
            if (this.id !== command.gameID) {
                throw new InteractableCommandError('Game ID mismatch');
            }
            game.leave(player);
        }
        throw new InteractableCommandError('Invalid command');
    }

}