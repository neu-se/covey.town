import HangmanGame from './HangmanGame';
import TTLGame from './TTLGame';
import {CoveyTownList} from "../../../../../services/roomService/src/CoveyTypes";
import {GameList} from "../gamesClient/Types";


export default class GameController {

  private static _instance: GameController;

  private _gamesList: (TTLGame | HangmanGame )[] = [];

  get gamesList(): (TTLGame | HangmanGame)[] {
    return this._gamesList;
  }

  set gamesList(value: (TTLGame | HangmanGame )[]) {
    this._gamesList = value;
  }

  getGames(): GameList {
    return this._gamesList.map(game => ({
      gameID: game.id,
      gameState: game.gameState,
      gameType: (game.alreadyGuessed ? 'Hangman' : 'Two Truths and a Lie'),
      player1Username: game.player1Username,
      player2ID: game.player2ID,
      }));
  }

  static getInstance(): GameController {
    if (GameController._instance === undefined) {
      GameController._instance = new GameController();
    }
    return GameController._instance;
  }
}

