import { TTLPlayer1Move, TTLPlayer2Move, HangmanPlayer1Move, HangmanPlayer2Move } from './GameTypes';
import { GameList } from './GameList';

export interface ResponseEnvelope<T> {
  isOK: boolean;
  message?: string;
  response?: T;
}

export interface GameCreateRequest {
  player1Id: string;
  player1Username: string;
  gameType: string;
  initialGameState?: HangmanWord | TTLChoices;
}

export type HangmanWord = { word: string };
export type TTLChoices = { choice1: string, choice2: string, choice3: string, correctLie: number };

export interface GameCreateResponse {
  gameId: string;
}

export interface GameUpdateRequest {
  gameId: string;
  player?: number;
  move?:  TTLPlayer1Move | TTLPlayer2Move | HangmanPlayer1Move | HangmanPlayer2Move;
  player2Id?: string;
  player2Username?: string;
}

export interface GameDeleteRequest {
  gameId: string;
}

export interface GameListResponse {
  games: GameList;
}

