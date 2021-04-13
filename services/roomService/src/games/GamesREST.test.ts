/* eslint-disable import/first */

import * as http from 'http';
import { AddressInfo } from 'net';
import { nanoid } from 'nanoid';
import * as Express from 'express';
import CORS = require('cors');
import HangmanServiceClient from '../client/GameServiceClient';
import { GameListResponse, HangmanWord, TTLChoices } from '../client/GameTypes';
import addTownRoutes from '../router/towns';
import TTLGameServiceClient from '../client/TTLGameServiceClient';


type TestGameData = {
  id: string,
  gameState: TTLChoices | HangmanWord,
  player1ID: string,
  player1Username: string,
  player2ID: string,
  player2Username: string,
};

function expectGameListMatches(games: GameListResponse, game: TestGameData) {
  const matching = games.games.find(gameInfo => gameInfo.gameId === game.id);
  expect(matching).toBeDefined();
  if (matching !== undefined) {
    expect(matching.gameState)
      .toBe(game.gameState);
  }
}

describe('HangmanServiceAPIREST', () => {
  let server: http.Server;
  let apiClient: HangmanServiceClient;

  async function createHangmanGameForTesting(player1IDToUse?: string, player1UsernameToUse?: string, hangmanWordToUse?: string, gameType = 'Hangman'): Promise<TestGameData> {
    const player1ID = player1IDToUse !== undefined ? player1IDToUse :
      `id${nanoid()}`;
    const player1Username = player1UsernameToUse !== undefined ? player1UsernameToUse :
      `name${nanoid()}`;
    const hangmanWord = hangmanWordToUse !== undefined ? hangmanWordToUse :
      `word${nanoid()}`;
    const initialGameState = { word: hangmanWord };
    const ret = await apiClient.createHangmanGame({
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

    apiClient = new HangmanServiceClient(`http://127.0.0.1:${address.port}`);
  });
  afterAll(async () => {
    await server.close();
  });
  describe('HangmanGameCreateAPI', () => {
    it('Allows for multiple games with the same player1ID', async () => {
      const firstGame = await createHangmanGameForTesting();
      const secondGame = await createHangmanGameForTesting(firstGame.player1ID);
      expect(firstGame.id)
        .not
        .toBe(secondGame.id);
    });
    it('Prohibits a blank player1ID', async () => {
      try {
        await createHangmanGameForTesting('');
        fail('createHangmanGame should throw an error if player1ID is empty string');
      } catch (err) {
        // OK
      }
    });
    it('Allows for multiple games with the same player1Username', async () => {
      const firstGame = await createHangmanGameForTesting();
      const secondGame = await createHangmanGameForTesting(firstGame.player1Username);
      expect(firstGame.id)
        .not
        .toBe(secondGame.id);
    });
    it('Prohibits a blank player1Username', async () => {
      try {
        await createHangmanGameForTesting(undefined, '');
        fail('createHangmanGame should throw an error if player1Username is empty string');
      } catch (err) {
        // OK
      }
    });

    it('Prohibits a blank initialGameState', async () => {
      try {
        await createHangmanGameForTesting(undefined, undefined, '');
        fail('createHangmanGame should throw an error if initialGameState is empty string');
      } catch (err) {
        // OK
      }
    });
  });

  describe('GamesListAPI', () => {
    it('Allows for multiple games with the same player1ID', async () => {
      const game1 = await createHangmanGameForTesting();
      const game2 = await createHangmanGameForTesting(game1.player1ID);

      const games = await apiClient.listHangmanGames();
      expectGameListMatches(games, game1);
      expectGameListMatches(games, game2);
    });
    it('Allows for multiple games with the same player1Username', async () => {
      const game1 = await createHangmanGameForTesting();
      const game2 = await createHangmanGameForTesting(undefined, game1.player1Username);


      const games = await apiClient.listHangmanGames();
      expectGameListMatches(games, game1);
      expectGameListMatches(games, game2);
    });
  });

  describe('HangmanGameDeleteAPI', () => {
    it('Deletes a game if given a valid gameId, no longer allowing it to be joined or listed', async () => {
      const { id } = await createHangmanGameForTesting();
      await apiClient.deleteHangmanGame({
        gameId: id,
      });
      try {
        await apiClient.updateHangmanGame({
          gameId: id,
          player2Id: nanoid(),
          player2Username: nanoid(),
        });
        fail('Expected updateGame to throw an error');
      } catch (e) {
        // Expected
      }
      const listedGames = await apiClient.listHangmanGames();
      if (listedGames.games.find(r => r.gameId === id)) {
        fail('Expected the deleted game to no longer be listed');
      }
    });
  });
  describe('HangmanGameUpdateAPI', () => {
    it('Checks the gameId before updating any values', async () => {
      const game1 = await createHangmanGameForTesting();
      expectGameListMatches(await apiClient.listHangmanGames(), game1);
      try {
        await apiClient.updateHangmanGame({
          gameId: game1.id.concat('1'),
          player2Id: nanoid(),
          player2Username: nanoid(),
        });
        fail('updateGame with an invalid gameId should throw an error');
      } catch (err) {
        // error
      }

      // Make sure name or vis didn't change
      expectGameListMatches(await apiClient.listHangmanGames(), game1);
    });
    it('Updates the player2 info as requested', async () => {
      const game1 = await createHangmanGameForTesting();
      expectGameListMatches(await apiClient.listHangmanGames(), game1);
      await apiClient.updateHangmanGame({
        gameId: game1.id,
        player2Id: 'newId',
        player2Username: 'newName',
      });
      game1.player2ID = 'newId';
      game1.player2Username = 'newName';
      expectGameListMatches(await apiClient.listHangmanGames(), game1);
    });
  });
});

describe('TTLServiceAPIREST', () => {
  let server: http.Server;
  let apiClient: TTLGameServiceClient;

  async function createTTLGameForTesting(player1IDToUse?: string, player1UsernameToUse?: string, gameType = 'TTL'): Promise<TestGameData> {
    const player1ID = player1IDToUse !== undefined ? player1IDToUse :
      `id${nanoid()}`;
    const player1Username = player1UsernameToUse !== undefined ? player1UsernameToUse :
      `name${nanoid()}`;
    const initialGameState = { choice1: 'a', choice2: 'b', choice3: 'c', correctLie: 1 };
    const ret = await apiClient.createTTLGame({
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

    apiClient = new TTLGameServiceClient(`http://127.0.0.1:${address.port}`);
  });
  afterAll(async () => {
    await server.close();
  });
  // describe('HangmanGameCreateAPI', () => {
  //   it('Allows for multiple games with the same player1ID', async () => {
  //     const firstGame = await createHangmanGameForTesting();
  //     const secondGame = await createHangmanGameForTesting(firstGame.player1ID);
  //     expect(firstGame.id)
  //       .not
  //       .toBe(secondGame.id);
  //   });
  //   it('Prohibits a blank player1ID', async () => {
  //     try {
  //       await createHangmanGameForTesting('');
  //       fail('createHangmanGame should throw an error if player1ID is empty string');
  //     } catch (err) {
  //       // OK
  //     }
  //   });
  //   it('Allows for multiple games with the same player1Username', async () => {
  //     const firstGame = await createHangmanGameForTesting();
  //     const secondGame = await createHangmanGameForTesting(firstGame.player1Username);
  //     expect(firstGame.id)
  //       .not
  //       .toBe(secondGame.id);
  //   });
  //   it('Prohibits a blank player1Username', async () => {
  //     try {
  //       await createHangmanGameForTesting(undefined, '');
  //       fail('createHangmanGame should throw an error if player1Username is empty string');
  //     } catch (err) {
  //       // OK
  //     }
  //   });
  //   it('Allows for multiple games with the same initial hangmanWord', async () => {
  //     const firstGame = await createHangmanGameForTesting();
  //     const secondGame = await createHangmanGameForTesting(firstGame.gameState);
  //     expect(firstGame.id)
  //       .not
  //       .toBe(secondGame.id);
  //   });
  //   it('Prohibits a blank initialGameState', async () => {
  //     try {
  //       await createHangmanGameForTesting(undefined, undefined, '');
  //       fail('createHangmanGame should throw an error if initialGameState is empty string');
  //     } catch (err) {
  //       // OK
  //     }
  //   });
  // });
  //
  // describe('GamesListAPI', () => {
  //   it('Allows for multiple games with the same player1ID', async () => {
  //     const game1 = await createHangmanGameForTesting();
  //     const game2 = await createHangmanGameForTesting(game1.player1ID);
  //
  //     const games = await apiClient.listHangmanGames();
  //     expectGameListMatches(games, game1);
  //     expectGameListMatches(games, game2);
  //   });
  //   it('Allows for multiple games with the same player1Username', async () => {
  //     const game1 = await createHangmanGameForTesting();
  //     const game2 = await createHangmanGameForTesting(undefined, game1.player1Username);
  //
  //
  //     const games = await apiClient.listHangmanGames();
  //     expectGameListMatches(games, game1);
  //     expectGameListMatches(games, game2);
  //   });
  //   it('Allows for multiple games with the same initial hangmanWord', async () => {
  //     const game1 = await createHangmanGameForTesting();
  //     const game2 = await createHangmanGameForTesting(undefined, undefined, game1.gameState);
  //
  //     const games = await apiClient.listHangmanGames();
  //     expectGameListMatches(games, game1);
  //     expectGameListMatches(games, game2);
  //   });
  // });
  //
  // describe('HangmanGameDeleteAPI', () => {
  //   it('Deletes a game if given a valid gameId, no longer allowing it to be joined or listed', async () => {
  //     const {id} = await createHangmanGameForTesting();
  //     await apiClient.deleteHangmanGame({
  //       gameId: id,
  //     });
  //     try {
  //       await apiClient.updateHangmanGame({
  //         gameId: id,
  //         player2Id: nanoid(),
  //         player2Username: nanoid(),
  //       });
  //       fail('Expected updateGame to throw an error');
  //     } catch (e) {
  //       // Expected
  //     }
  //     const listedGames = await apiClient.listHangmanGames();
  //     if (listedGames.games.find(r => r.gameId === id)) {
  //       fail('Expected the deleted game to no longer be listed');
  //     }
  //   });
  // });
  // describe('HangmanGameUpdateAPI', () => {
  //   it('Checks the gameId before updating any values', async () => {
  //     const game1 = await createHangmanGameForTesting();
  //     expectGameListMatches(await apiClient.listHangmanGames(), game1);
  //     try {
  //       await apiClient.updateHangmanGame({
  //         gameId: game1.id.concat('1'),
  //         player2Id: nanoid(),
  //         player2Username: nanoid(),
  //       });
  //       fail('updateGame with an invalid gameId should throw an error');
  //     } catch (err) {
  //       // error
  //     }
  //
  //     // Make sure name or vis didn't change
  //     expectGameListMatches(await apiClient.listHangmanGames(), game1);
  //   });
  //   it('Updates the player2 info as requested', async () => {
  //     const game1 = await createHangmanGameForTesting();
  //     expectGameListMatches(await apiClient.listHangmanGames(), game1);
  //     await apiClient.updateHangmanGame({
  //       gameId: game1.id,
  //       player2Id: 'newId',
  //       player2Username: 'newName',
  //     });
  //     game1.player2ID = 'newId';
  //     game1.player2Username = 'newName';
  //     expectGameListMatches(await apiClient.listHangmanGames(), game1);
  //   });
  // });
});
