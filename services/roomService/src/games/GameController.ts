import IGame from "./IGame";
import {GameCreateRequest, GameFindRequest, GameUpdateRequest, GameDeleteRequest} from "./RequestTypes"
import CoveyTownsStore from "../lib/CoveyTownsStore";

export default class GameController {
  constructor(gameModel: IGame) { //TODO: What data type should gameModel be?
    this._gameModel = gameModel;
  }

   private _gameModel;

   get gameModel(){
     return this._gameModel;
   };

   set gameModel(game){
     this._gameModel = game;
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

  /**
   * Returns list of all games on the server
   *
   */
  static async findAllGames()  {};

  /**
   * Deletes a game from the server after it is finished
   *
   * @param gameID (String)
   */
  static async deleteGame(requestData: GameDeleteRequest)  {};

  }


