
export interface ResponseEnvelope<T> {
  isOK: boolean;
  message?: string;
  response?: T;
}

export interface TicGameCreateRequest {
  player1: string;
}

export interface TicGameCreateResponse {
  gameID: string;
}

export interface TicGameUpdateRequest {
  gameID: string;
  move: TicMove;
}

export type TicMove = { x: number, y: number, player: string};

export interface TicGameDeleteRequest {
  gameID: string;
}

export interface TicGameListResponse {
  games: TicGameList;
}

export type TicGameList = { gameID: string; gameState: string }[];

export interface TicGameJoinRequest {
  player2: string;
  gameID: string;
}

export interface TicGameJoinResponse {
  gameID: string;
}

