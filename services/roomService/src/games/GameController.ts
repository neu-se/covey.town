import {
  ResponseEnvelope,
  GameCreateRequest,
  GameCreateResponse,
  GameDeleteRequest,
  GameJoinRequest, GameJoinResponse,
  GameUpdateRequest,
  HangmanWord,
  TTLChoices
} from '../client/Types';
import TicTacToeGame from "./TicTacToeGame";
import HangmanGame from "./HangmanGame";
import TTLGame from "./TTLGame";


export default class GameController {
  constructor(gameModel: TicTacToeGame | HangmanGame | TTLGame) {
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
  async createGame(requestData: GameCreateRequest): Promise<ResponseEnvelope<GameCreateResponse>> {
    const player1 = requestData.player1
    const initialState = requestData.initialGameState
    const newGame = (requestData.gameType === "Hangman" ?  new HangmanGame :
      requestData.gameType === "TTL" ? new TTLGame :
        requestData.gameType === "TicTacToe" ? new TicTacToeGame : undefined)
    if (newGame === undefined) {
      return {
        isOK: false,
        message: 'Error: No game type specified',
      };
    }
    this.gameModel = newGame
    return {
      isOK: true,
      response: {
        gameID: newGame.id
      }
    }
  }

  async joinGame(requestData: GameJoinRequest): Promise<ResponseEnvelope<GameJoinResponse>> {
    const player2 = requestData.player2
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


