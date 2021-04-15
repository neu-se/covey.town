import HangmanGame from './HangmanGame';
import TTLGame from './TTLGame';


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
    return this.gamesList.find(game =>  game.id === gameId);
  }

  deleteGame(gameId: string): boolean {
    const gameIndex = this.gamesList.findIndex( game => game.id === gameId);
    if (gameIndex === -1) {
      return false;
    }
    this.gamesList.splice(gameIndex, 1);
    return true;
  }

  static getInstance(): GameController {
    if (GameController._instance === undefined) {
      GameController._instance = new GameController();
    }
    return GameController._instance;
  }
}

