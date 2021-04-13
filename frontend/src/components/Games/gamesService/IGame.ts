import { HangmanPlayer1Move, HangmanPlayer2Move, TTLPlayer1Move, TTLPlayer2Move } from '../gamesClient/Types';

export default interface IGame {

  id : string;

  gameState : string;

  player1ID: string;

  player1Username: string;

  player2ID : string;

  player2Username: string;


  initializeGame(initialGameData?:string): string;

  move(move: TTLPlayer1Move | TTLPlayer2Move | HangmanPlayer1Move | HangmanPlayer2Move) : void;

  isGameOver() : boolean;

  finishGame(winningPlayerID: string): string;

  playerJoin(player2ID: string, player2Username: string) : void;
}
