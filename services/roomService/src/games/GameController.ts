import IGame from './IGame';
import CoveyTownsStore from '../lib/CoveyTownsStore';
import {GameCreateRequest, GameDeleteRequest, GameUpdateRequest} from '../client/Types';


export default class GameController {
  constructor(gameModel: IGame) { // TODO: What data type should gameModel be?
    this._gameModel = gameModel;
  }

  private _gameModel;

  get gameModel(){
    return this._gameModel;
  }

  set gameModel(game){
    this._gameModel = game;
  }


  /**
   * Creates a new game session
   *
   */
  static async createGame(requestData: GameCreateRequest) {
    return requestData;
  }

  /**
   * Updates the game state after a player makes a move
   *
   * @param gameId (String)
   * @param player who just moved (Player object)
   * @param player move (String)
   */
  static async updateGame(requestData: GameUpdateRequest) {
    return requestData;
  }

  /**
   * Returns list of all games on the server
   *
   */
  static async findAllGames()  {
    return 0;
  }

  /**
   * Deletes a game from the server after it is finished
   *
   * @param gameID (String)
   */
  static async deleteGame(requestData: GameDeleteRequest)  {
    return requestData;
  }

}


