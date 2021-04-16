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
  townID: string,
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
    expect(matching.player1Username)
      .toBe(game.player1Username);
  }
}

describe('GameServiceAPIREST', () => {
  let server: http.Server;
  let apiClient: GameServiceClient;

  async function createGameForTesting(gameType: string, player1IDToUse?: string, player1UsernameToUse?: string, townIDtoUse?: string, hangmanWordToUse?: HangmanWord, ttlChoicesToUse?: TTLChoices): Promise<TestGameData> {
    const townID = townIDtoUse !== undefined ? townIDtoUse :
      `town${nanoid()}`;
    const player1ID = player1IDToUse !== undefined ? player1IDToUse :
      `id${nanoid()}`;
    const player1Username = player1UsernameToUse !== undefined ? player1UsernameToUse :
      `name${nanoid()}`;
    const hangmanWord = hangmanWordToUse !== undefined ? hangmanWordToUse :
      { word: `word${nanoid()}` };
    const ttlChoices = ttlChoicesToUse !== undefined ? ttlChoicesToUse :
      { choice1: `word${nanoid()}`, choice2: `word${nanoid()}`, choice3: `word${nanoid()}`, correctLie: 3 };
    let initialGameState: HangmanWord | TTLChoices;
    if (gameType === 'Hangman') {
      initialGameState = hangmanWord;
    } else {
      initialGameState = ttlChoices;
    }
    const ret = await apiClient.createGame({
      townID,
      player1Id: player1ID,
      player1Username,
      gameType,
      initialGameState,
    });
    return {
      id: ret.gameId,
      townID,
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
    it('Prohibits a blank player1Username', async () => {
      try {
        await createGameForTesting('hangman', '');
        fail('createHangmanGame should throw an error if player1Username is empty string');
      } catch (err) {
        // OK
      }
    });
    // it('Prohibits a blank townID', async () => {
    //   try {
    //     await createGameForTesting('hangman', '');
    //     fail('createHangmanGame should throw an error if player1Username is empty string');
    //   } catch (err) {
    //     // OK
    //   }
    // });
  });

  describe('GamesListAPI', () => {
    it('Allows for multiple games with the same player1ID', async () => {
      const game1 = await createGameForTesting('Hangman');
      const game2 = await createGameForTesting('Hangman', game1.player1ID, undefined, game1.townID);

      const games = await apiClient.listGames({ townID: game1.townID });
      expectGameListMatches(games, game1);
      expectGameListMatches(games, game2);
    });
  });

  describe('GameDeleteAPI', () => {
    it('Deletes a game if given a valid gameId, no longer allowing it to be joined or listed', async () => {
      const game = await createGameForTesting('Hangman');
      await apiClient.deleteGame({
        townID: game.townID,
        gameId: game.id,
      });
      try {
        await apiClient.updateGame({
          townID: game.townID,
          gameId: game.id,
          player2Id: nanoid(),
          player2Username: nanoid(),
        });
        fail('Expected updateGame to throw an error');
      } catch (e) {
        // Expected
      }
      try {
        await apiClient.updateGame({
          townID: game.townID,
          gameId: game.id,
          move: { letter: 'a' },
        });
        fail('Expected updateGame to throw an error');
      } catch (e) {
        // Expected
      }
      const listedGames = await apiClient.listGames({ townID: game.townID });
      if (listedGames.games.find(r => r.id === game.id)) {
        fail('Expected the deleted game to no longer be listed');
      }
    });
  });
  describe('GameUpdateAPI', () => {
    it('Checks the gameId before updating any values', async () => {
      const game1 = await createGameForTesting('Hangman');
      expectGameListMatches(await apiClient.listGames({ townID: game1.townID }), game1);
      try {
        await apiClient.updateGame({
          gameId: game1.id.concat('1'),
          townID: game1.townID,
          player2Id: nanoid(),
          player2Username: nanoid(),
        });
        fail('updateGame with an invalid gameId should throw an error');
      } catch (err) {
        // error
      }

      // Make sure name or vis didn't change
      expectGameListMatches(await apiClient.listGames({ townID: game1.townID }), game1);
    });
    it('Updates the player2 info as requested', async () => {
      const game1 = await createGameForTesting('Hangman');
      const game2 = await createGameForTesting('ttl');
      expectGameListMatches(await apiClient.listGames({ townID: game1.townID }), game1);
      expectGameListMatches(await apiClient.listGames({ townID: game2.townID }), game2);

      await apiClient.updateGame({
        townID: game1.townID,
        gameId: game1.id,
        player2Id: 'newId',
        player2Username: 'newName',
      });
      game1.player2ID = 'newId';
      game1.player2Username = 'newName';

      await apiClient.updateGame({
        townID: game2.townID,
        gameId: game2.id,
        player2Id: 'newId',
        player2Username: 'newName',
      });
      game2.player2ID = 'newId';
      game2.player2Username = 'newName';

      expectGameListMatches(await apiClient.listGames({ townID: game1.townID }), game1);
      expectGameListMatches(await apiClient.listGames({ townID: game2.townID }), game2);

    });
  });
});
