import IGame from './IGame';
import {
  ResponseEnvelope,
  GameCreateRequest,
  GameCreateResponse,
  GameDeleteRequest,
  GameJoinRequest, GameJoinResponse,
  GameUpdateRequest
} from '../client/Types';


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
   * Creates a new game session initialized by one player
   *
   */
  async createGame(requestData: GameCreateRequest): Promise<ResponseEnvelope<GameCreateResponse> {
    const player1 = requestData.player1
    const initialState = requestData.initialGameState
    const newGame =
    return {
      isOK: true,
      response: {
        gameID: newGame.id
      }
    }
  }

  async joinGame(requestData: GameJoinRequest): Promise<ResponseEnvelope<GameJoinResponse> {
    const player2 = requestData.player2
    await
    return {
      isOK: true,
      response: {
        gameID: requestData.gameID
      }
    }
  }

  /**
   * Updates the game state after a player makes a move
   *
   * @param requestData
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
   * @param requestData
   */
  static async deleteGame(requestData: GameDeleteRequest)  {
    return requestData;
  }

}


