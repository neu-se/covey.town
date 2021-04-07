import { nanoid } from 'nanoid';
import IGame from './IGame';
import { TicMove } from '../client/Types';

export default class TicTacToeGame implements IGame {
  private _id: string;

  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  constructor() {
    this._id = nanoid();
  }

  gameState: string;

  player1ID: string;

  player2ID: string;


  finishGame(winningPlayerID: string): string {
    return '';
  }

  initializeGame(initialGameData?: string): string {
    return '';
  }

  isGameOver(): boolean {
    return false;
  }


  move(move: TicMove ): void {
  }

  playerJoin(player2ID: string): void {
  }
}
