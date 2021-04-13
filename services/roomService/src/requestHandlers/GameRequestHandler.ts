import {
  GameCreateRequest,
  GameCreateResponse, GameDeleteRequest, GameListResponse, GameUpdateRequest, GameUpdateResponse, ResponseEnvelope,
} from '../client/GameRequestTypes';
import {
  HangmanPlayer2Move,
  HangmanWord,
  TTLChoices, TTLPlayer2Move,
} from '../client/GameTypes';
import HangmanGame from '../games/HangmanGame';
import TTLGame from '../games/TTLGame';
import GameController from '../games/GameController';

/**
 * Creates a new game session initialized by one player
 *
 */
export async function createGame(requestData: GameCreateRequest): Promise<ResponseEnvelope<GameCreateResponse>> {
  const controller = GameController.getInstance();
  let newGame;
  const { player1Id } = requestData;
  const { player1Username } = requestData;
  const initialState = requestData.initialGameState;
  if (requestData.gameType === 'Hangman') {
    newGame = new HangmanGame(player1Id, player1Username, <HangmanWord>(initialState));
  } else if (requestData.gameType === 'TTL') {
    newGame = new TTLGame(player1Id, player1Username, <TTLChoices>(initialState));
  }
  if (newGame === undefined) {
    return {
      isOK: false,
      message: 'Error: No game type specified',
    };
  }
  controller.gamesList.push(newGame);
  return {
    isOK: true,
    response: {
      gameId: newGame.id,
    },
  };
}


/**
 * Updates the game state after a player makes a move or a new player joins
 *
 * @param requestData
 */
export async function updateGame(requestData: GameUpdateRequest): Promise<ResponseEnvelope<GameUpdateResponse>> {
  const controller = GameController.getInstance();
  let targetGame;
  if (requestData.move) {
    const { move } = requestData;
    targetGame = controller.gamesList.find(game => game.id === requestData.gameId);
    if (targetGame !== undefined) {
      if (targetGame instanceof TTLGame) {
        targetGame.move(<TTLPlayer2Move>move);
        return {
          isOK: true,
          response: {
            gameId: targetGame.id,
          },
        };
      }
      if (targetGame instanceof HangmanGame) {
        targetGame.move(<HangmanPlayer2Move>move);
        return {
          isOK: true,
          response: {
            gameId: targetGame.id,
          },
        };
      }
      return {
        isOK: false,
        message: 'Error: Game not found',
      };
    }
  }
  if (requestData.player2Id && requestData.player2Username) {
    const { player2Id } = requestData;
    const { player2Username } = requestData;
    targetGame = controller.gamesList.find(game => game.id === requestData.gameId);
    if (targetGame !== undefined) {
      targetGame.playerJoin(player2Id, player2Username);
      return {
        isOK: true,
        response: {
          gameId: targetGame.id,
        },
      };
    }
    return {
      isOK: false,
      message: 'Error: Game not found',
    };
  }
  return {
    isOK: false,
    message: 'Error: Game not found',
  };
}

/**
 * Returns list of all games on the server
 *
 */
export async function findAllGames(): Promise<ResponseEnvelope<GameListResponse>> {
  const controller = GameController.getInstance();
  return {
    isOK: true,
    response: { games: controller.getGames() },
  };
}

/**
 * Returns an instance of a game found by its ID
 *
 */
export function findGameById(gameId: string): (HangmanGame | TTLGame | undefined) {
  const controller = GameController.getInstance();
  try {
    return controller.gamesList.find(game => game.id === gameId);
  } catch (e) {
    throw new Error(e);
  }
}

/**
 * Deletes a game from the server after it is finished
 *
 * @param requestData
 */
export async function deleteGame(requestData: GameDeleteRequest): Promise<ResponseEnvelope<Record<string, null>>> {
  const controller = GameController.getInstance();
  const success = controller.deleteGame(requestData.gameId);
  return {
    isOK: success,
    response: {},
    message: !success ? 'Invalid gameId. Please double check your game data.' : undefined,
  };
}
