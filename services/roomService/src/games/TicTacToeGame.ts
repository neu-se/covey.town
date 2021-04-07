import IGame from './IGame';
import { TicMove } from '../client/Types';

export default class TicTacToeGame implements IGame {
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
