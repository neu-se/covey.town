import {
  ResponseEnvelope,
  GameCreateRequest,
  GameCreateResponse,
  GameDeleteRequest,
  GameJoinRequest, GameJoinResponse,
  GameUpdateRequest, GameListResponse,
} from '../client/Types';
import TicTacToeGame from './TicTacToeGame';
import HangmanGame from './HangmanGame';
import TTLGame from './TTLGame';


export default class GameController {

  private _gamesList!: (TTLGame | HangmanGame | TicTacToeGame)[];

  get gamesList(): (TTLGame | HangmanGame | TicTacToeGame)[] {
    return this._gamesList;
  }

  set gamesList(value: (TTLGame | HangmanGame | TicTacToeGame)[]) {
    this._gamesList = value;
  }

  constructor() {
    this.gamesList = [];
  }

  /**
   * Creates a new game session initialized by one player
   *
   */
  async createGame(requestData: GameCreateRequest): Promise<ResponseEnvelope<GameCreateResponse>> {
    let newGame;
    const {player1} = requestData;
    const initialState = requestData.initialGameState;
    if (requestData.gameType === 'Hangman') {
      newGame = new HangmanGame();
    } else if (requestData.gameType === 'TTL') {
      newGame = new TTLGame();
    } else if (requestData.gameType === 'TicTacToe') {
      newGame = new TicTacToeGame();
    }
    if (newGame === undefined) {
      return {
        isOK: false,
        message: 'Error: No game type specified',
      };
    }
    this.gamesList.push(newGame)
    return {
      isOK: true,
      response: {
        gameID: newGame.id,
      },
    };
  }



  async joinGame(requestData: GameJoinRequest): Promise<ResponseEnvelope<GameJoinResponse>> {
    const {player2} = requestData;
    const targetGame = this.gamesList.find(game => game.id == requestData.gameID);
    if (targetGame === undefined) {
      return {
        isOK: false,
        message: 'Error: Target game not found',
      };
    }
    targetGame.playerJoin(player2);
    return {
      isOK: true,
      response: {
        gameID: targetGame.id,
      },
    };
  }

  /**
   * Updates the game state after a player makes a move
   *
   * @param requestData
   */
  async updateGame(requestData: GameUpdateRequest): Promise<ResponseEnvelope<Record<string, null>>> {
    const {move} = requestData;
    const targetGame = this.gamesList.find(game => game.id == requestData.gameID);
    if (targetGame === undefined) {
      return {
        isOK: false,
        message: 'Error: Target game not found',
      };
    }
    const success = targetGame.move(move);
    return {
      isOK: true,
      response: {},
      message: !success ? 'Invalid password or update values specified. Please double check your town update password.' : undefined,
    };
  }

  /**
   * Returns list of all games on the server
   *
   */
  async findAllGames(): Promise<ResponseEnvelope<GameListResponse>>  {
    return {
      isOK: true,
      response: {
        games:
      },
    };    }

  /**
   * Deletes a game from the server after it is finished
   *
   * @param requestData
   */
  static async deleteGame(requestData: GameDeleteRequest): Promise<ResponseEnvelope<Record<string, null>>>  {
    const success =
    return {
      isOK: true,
      response: {},
      message: !success ? 'Invalid password or update values specified. Please double check your town update password.' : undefined,
    };
  }

}


