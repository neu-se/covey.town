export interface ResponseEnvelope<T> {
  isOK: boolean;
  message?: string;
  response?: T;
}

export interface GameCreateRequest {
  player1: string;
  initialGameState?: HangmanWord | TTLChoices;
}

export type HangmanWord = { word: string };
export type TTLChoices = { choice1: string, choice2: string, choice3: string, correctLie: number };

export interface GameCreateResponse {
  gameID: string;
}

export interface GameUpdateRequest {
  gameID: string;
  move: TicMove | TTLPlayer1Move | TTLPlayer2Move | HangmanPlayer1Move | HangmanPlayer2Move;
}

export type TicMove = { x: number, y: number, player: string};
export type TTLPlayer2Move = { guess: number };
export type TTLPlayer1Move = { guessCorrect: boolean };
export type HangmanPlayer2Move = { letter: string };
export type HangmanPlayer1Move = { correct: boolean, finalWord?: string, limbLost: Limb };

export enum Limb {
  Head,
  Back,
  LeftArm,
  RightArm,
  LeftLeg,
  RightLeg,
}


export interface GameDeleteRequest {
  gameID: string;
}

export interface GameListResponse {
  games: GameList;
}

export type GameList = { gameID: string; gameState: string }[];

export interface GameJoinRequest {
  player2: string;
  gameID: string;
}

export interface GameJoinResponse {
  gameID: string;
}




