import { TicMove, HangmanPlayer1Move, HangmanPlayer2Move, TTLPlayer1Move, TTLPlayer2Move } from '../client/Types';

export default interface IGame {

  id : string;

  gameState : string;

  player1ID: string;

  player2ID : string;

  initializeGame(): void;

  move(move: TicMove | TTLPlayer1Move | TTLPlayer2Move | HangmanPlayer1Move | HangmanPlayer2Move) : void;

  isGameOver() : boolean;

  finishGame(gameState : string, player1ID: string, player2ID: string): void;
}
