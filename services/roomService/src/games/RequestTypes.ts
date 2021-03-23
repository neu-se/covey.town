import Player from "../types/Player";

export interface GameCreateRequest {
  players: Player[];
  gameType: String;
}

export interface GameUpdateRequest {
  gameId: String;
  player: Player;
  move: String
}

export interface GameFindRequest {
  gameId: String
}

export interface GameDeleteRequest {
  gameId: String
}
