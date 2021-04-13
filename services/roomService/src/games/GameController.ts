import HangmanGame from './HangmanGame';
import TTLGame from './TTLGame';
import { GameList } from '../client/GameTypes';


export default class GameController {

  private static _instance: GameController;

  private _gamesList: (TTLGame | HangmanGame )[] = [];

  get gamesList(): (TTLGame | HangmanGame)[] {
    return this._gamesList;
  }

  set gamesList(value: (TTLGame | HangmanGame )[]) {
    this._gamesList = value;
  }

  getGames(): (TTLGame | HangmanGame)[] {
    return this._gamesList;
  }

  getGameByID(gameId: string): HangmanGame | TTLGame | undefined {
    return this.gamesList.find(game => game.id === gameId);
  }

  deleteGame(gameId: string): boolean {
    const gameToDelete = this.getGameByID(gameId);
    const newGamesList = this.gamesList.filter(game => game !== gameToDelete);
    if (newGamesList.length < this.gamesList.length) {
      this.gamesList = newGamesList;
      return true;
    }
    return false;
  }

  static getInstance(): GameController {
    if (GameController._instance === undefined) {
      GameController._instance = new GameController();
    }
    return GameController._instance;
  }
}

