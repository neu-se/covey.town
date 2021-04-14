import http from 'http';
import { AddressInfo } from 'net';
import { nanoid } from 'nanoid';
import Express from 'express';
import CORS from 'cors';
import { HangmanWord, TTLChoices } from '../client/GameTypes';
import addTownRoutes from '../router/towns';
import { GameListResponse } from '../client/GameRequestTypes';
import GameServiceClient from '../client/GameServiceClient';


type TestGameData = {
  id: string,
  gameState: TTLChoices | HangmanWord,
  player1ID: string,
  player1Username: string,
  player2ID: string,
  player2Username: string,
};

function expectGameListMatches(games: GameListResponse, game: TestGameData) {
  const matching = games.games.find(g => g.id === game.id);
  expect(matching).toBeDefined();
  if (matching !== undefined) {
    expect(matching.gameState)
      .toBe(game.gameState);
  }
}

describe('GameServiceAPIREST', () => {
  let server: http.Server;
  let apiClient: GameServiceClient;

  async function createGameForTesting(gameType: string, player1IDToUse?: string, player1UsernameToUse?: string, hangmanWordToUse?: HangmanWord, ttlChoicesToUse?: TTLChoices): Promise<TestGameData> {
    const player1ID = player1IDToUse !== undefined ? player1IDToUse :
      `id${nanoid()}`;
    const player1Username = player1UsernameToUse !== undefined ? player1UsernameToUse :
      `name${nanoid()}`;
    const hangmanWord = hangmanWordToUse !== undefined ? hangmanWordToUse :
      { word: `word${nanoid()}` };
    const ttlChoices = ttlChoicesToUse !== undefined ? ttlChoicesToUse :
      { choice1: `word${nanoid()}`, choice2: `word${nanoid()}`, choice3: `word${nanoid()}`, correctLie: 3 };
    let initialGameState : HangmanWord | TTLChoices;
    if (gameType === 'Hangman') {
      initialGameState = hangmanWord;
    } else {
      initialGameState = ttlChoices;
    }
    const ret = await apiClient.createGame({
      player1Id: player1ID,
      player1Username,
      gameType,
      initialGameState,
    });
    return {
      id: ret.gameId,
      gameState: initialGameState,
      player1ID,
      player1Username,
      player2ID: '',
      player2Username: '',
    };
  }

  beforeAll(async () => {
    const app = Express();
    app.use(CORS());
    server = http.createServer(app);

    addTownRoutes(server, app);
    await server.listen();
    const address = server.address() as AddressInfo;

    apiClient = new GameServiceClient(`http://127.0.0.1:${address.port}`);
  });
  afterAll(async () => {
    await server.close();
  });
  describe('GameCreateAPI', () => {
    it('Allows for multiple games with the same player1ID', async () => {
      const firstGame = await createGameForTesting('ttl');
      const secondGame = await createGameForTesting('ttl', firstGame.player1ID);
      expect(firstGame.id)
        .not
        .toBe(secondGame.id);
    });
    it('Prohibits a blank player1ID', async () => {
      try {
        await createGameForTesting('');
        fail('createHangmanGame should throw an error if player1ID is empty string');
      } catch (err) {
        // OK
      }
    });
    it('Allows for multiple games with the same player1Username', async () => {
      const firstGame = await createGameForTesting('ttl');
      const secondGame = await createGameForTesting('ttl', firstGame.player1Username);
      expect(firstGame.id)
        .not
        .toBe(secondGame.id);
    });
    it('Prohibits a blank player1Username', async () => {
      try {
        await createGameForTesting('hangman', '');
        fail('createHangmanGame should throw an error if player1Username is empty string');
      } catch (err) {
        // OK
      }
    });
  });

  // describe('GamesListAPI', () => {
  //   it('Allows for multiple games with the same player1ID', async () => {
  //     const game1 = await createGameForTesting('Hangman');
  //     const game2 = await createGameForTesting('Hangman', game1.player1ID);
  //
  //     const games = await apiClient.listGames();
  //     expectGameListMatches(games, game1);
  //     expectGameListMatches(games, game2);
  //   });
  //   it('Allows for multiple games with the same player1Username', async () => {
  //     const game1 = await createGameForTesting('hangman');
  //     const game2 = await createGameForTesting('hangman', undefined, game1.player1Username);
  //
  //
  //     const games = await apiClient.listGames();
  //     expectGameListMatches(games, game1);
  //     expectGameListMatches(games, game2);
  //   });
  // });
//
//   describe('HangmanGameDeleteAPI', () => {
//     it('Deletes a game if given a valid gameId, no longer allowing it to be joined or listed', async () => {
//       const { id } = await createHangmanGameForTesting();
//       await apiClient.deleteHangmanGame({
//         gameId: id,
//       });
//       try {
//         await apiClient.updateHangmanGame({
//           gameId: id,
//           player2Id: nanoid(),
//           player2Username: nanoid(),
//         });
//         fail('Expected updateGame to throw an error');
//       } catch (e) {
//         // Expected
//       }
//       const listedGames = await apiClient.listHangmanGames();
//       if (listedGames.games.find(r => r.gameId === id)) {
//         fail('Expected the deleted game to no longer be listed');
//       }
//     });
//   });
//   describe('HangmanGameUpdateAPI', () => {
//     it('Checks the gameId before updating any values', async () => {
//       const game1 = await createHangmanGameForTesting();
//       expectGameListMatches(await apiClient.listHangmanGames(), game1);
//       try {
//         await apiClient.updateHangmanGame({
//           gameId: game1.id.concat('1'),
//           player2Id: nanoid(),
//           player2Username: nanoid(),
//         });
//         fail('updateGame with an invalid gameId should throw an error');
//       } catch (err) {
//         // error
//       }
//
//       // Make sure name or vis didn't change
//       expectGameListMatches(await apiClient.listHangmanGames(), game1);
//     });
//     it('Updates the player2 info as requested', async () => {
//       const game1 = await createHangmanGameForTesting();
//       expectGameListMatches(await apiClient.listHangmanGames(), game1);
//       await apiClient.updateHangmanGame({
//         gameId: game1.id,
//         player2Id: 'newId',
//         player2Username: 'newName',
//       });
//       game1.player2ID = 'newId';
//       game1.player2Username = 'newName';
//       expectGameListMatches(await apiClient.listHangmanGames(), game1);
//     });
//   });
// });
});
