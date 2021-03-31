import IGame from "./IGame";
import {nanoid} from "nanoid";

export default class HangmanGame implements IGame {
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

  finishGame(gameState: string, player1ID: string, player2ID: string): void {
  }

  initializeGame(): void {
  }

  isGameOver(): boolean {
    return false;
  }

  move(move: TicMove | TTLPlayer1Move | TTLPlayer2Move | HangmanPlayer1Move | HangmanPlayer2Move): void {
  }
}
