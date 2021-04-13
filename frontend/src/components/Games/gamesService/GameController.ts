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

  static getInstance(): GameController {
    if (GameController._instance === undefined) {
      GameController._instance = new GameController();
    }
    return GameController._instance;
  }
}

