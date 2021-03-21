import IGame from "./IGame";
import {GameCreateRequest, GameFindRequest, GameUpdateRequest} from "./RequestTypes"
import CoveyTownsStore from "../lib/CoveyTownsStore";

export default class GameController {
  constructor(game: IGame) {
    this._game = game;
  }

   private _game: IGame;

   get game(){
     return this._game;
   };

   set game(game){
     this._game = game;
   }


  /**
   * Creates a new game session
   *
   */
  static async createGame(requestData: GameCreateRequest) {};

  /**
   * Updates the game state after a player makes a move
   *
   * @param gameId (String)
   * @param player who just moved (Player object)
   * @param player move (String)
   */
  static async updateGame(requestData: GameUpdateRequest) {};

  /**
   * Returns the game state to update the view
   *
   * @param gameID (String)
   */
  static async findGame(requestData: GameFindRequest)  {};

  }


