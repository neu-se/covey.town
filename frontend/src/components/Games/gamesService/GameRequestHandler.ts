import {
  GameCreateRequest,
  GameCreateResponse, GameDeleteRequest, GameListResponse, GameUpdateRequest, HangmanPlayer2Move,
  HangmanWord,
  ResponseEnvelope,
  TTLChoices, TTLPlayer2Move,
} from '../gamesClient/Types';
import HangmanGame from './HangmanGame';
import TTLGame from './TTLGame';
import GameController from './GameController';

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
      gameID: newGame.id,
    },
  };
}


/**
 * Updates the game state after a player makes a move or a new player joins
 *
 * @param requestData
 */
export async function updateGame(requestData: GameUpdateRequest): Promise<ResponseEnvelope<Record<string, null>>> {
  const controller = GameController.getInstance();
  let success = true;
  if (requestData.move) {
    const { move } = requestData;
    const targetGame = controller.gamesList.find(game => game.id === requestData.gameID);
    if (targetGame === undefined) {
      return {
        isOK: false,
        message: 'Error: Target game not found',
      };
    }
    if (targetGame instanceof TTLGame) {
      targetGame.move(<TTLPlayer2Move>move);
    } else if (targetGame instanceof HangmanGame) {
      targetGame.move(<HangmanPlayer2Move>move);
    } else {
      success = false;
    }
  }
  if (requestData.player2Id && requestData.player2Username) {
    const { player2Id } = requestData;
    const { player2Username } = requestData;
    const targetGame = controller.gamesList.find(game => game.id === requestData.gameID);
    if (targetGame === undefined) {
      success = false;
      return {
        isOK: false,
        message: 'Error: Target game not found',
      };
    }
    targetGame.playerJoin(player2Id, player2Username);
  }
  return {
    isOK: true,
    response: {},
    message: !success ? 'Invalid update values specified.' : undefined,
  };
}

/**
 * Returns list of all games on the server
 *
 */
export async function findAllGames(): Promise<ResponseEnvelope<GameListResponse>> {
  const controller = GameController.getInstance();
  const games = controller.gamesList.map(game => ({
      gameID: game.id,
      gameState: game.gameState,
    }),
  );
  return {
    isOK: true,
    response: {
      games,
    },
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
  let success;
  const updatedList = controller.gamesList.filter(game => game.id !== requestData.gameID);
  if (controller.gamesList.length !== updatedList.length) {
    controller.gamesList = updatedList;
    success = true;
  } else {
    success = false;
  }
  return {
    isOK: true,
    response: {},
    message: !success ? 'Game to delete not found. Game ID may be invalid.' : undefined,
  };
}
