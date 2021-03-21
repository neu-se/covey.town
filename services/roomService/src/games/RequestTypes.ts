import Player from "../types/Player";

export interface GameCreateRequest {
  players: Player[];
  gameType: String;
}

export interface GameUpdateRequest {
  player: Player;
  move: String
}

export interface GameFindRequest {
  gameId: String
}
