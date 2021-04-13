import * as http from 'http';
import { AddressInfo } from 'net';
import { nanoid } from 'nanoid';
import Express = require('express');
import HangmanServiceClient from '../client/HangmanServiceClient';
import { GameListResponse } from '../client/Types';
import addTownRoutes from '../router/towns';
import CORS = require('cors');


type TestGameData = {
  id : string,
  gameState : string,
  player1ID: string,
  player1Username: string,
  player2ID : string,
  player2Username: string,
};

function expectGameListMatches(games: GameListResponse, game: TestGameData) {
  const matching = games.games.find(gameInfo => gameInfo.gameID === game.id);
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
    const ret = await apiClient.createHangmanGame({
      player1Id: player1ID,
      player1Username,
      gameType,
      initialGameState: { word: hangmanWord },
    });
    return {
      id: ret.gameID,
      gameState: hangmanWord,
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
    it('Allows for multiple games with the same initial hangmanWord', async () => {
      const firstGame = await createHangmanGameForTesting();
      const secondGame = await createHangmanGameForTesting(firstGame.gameState);
      expect(firstGame.id)
        .not
        .toBe(secondGame.id);
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
    it('Allows for multiple games with the same initial hangmanWord', async () => {
      const game1 = await createHangmanGameForTesting();
      const game2 = await createHangmanGameForTesting(undefined, undefined, game1.gameState);

      const games = await apiClient.listHangmanGames();
      expectGameListMatches(games, game1);
      expectGameListMatches(games, game2);
    });
  });

  describe('HangmanGameDeleteAPI', () => {
    it('Deletes a game if given a valid gameID, no longer allowing it to be joined or listed', async () => {
      const { id } = await createHangmanGameForTesting();
      await apiClient.deleteHangmanGame({
        gameID: id,
      });
      try {
        await apiClient.updateHangmanGame({
          gameID: id,
          player2Id: nanoid(),
          player2Username: nanoid(),
        });
        fail('Expected updateGame to throw an error');
      } catch (e) {
        // Expected
      }
      const listedGames = await apiClient.listHangmanGames();
      if (listedGames.games.find(r => r.gameID === id)) {
        fail('Expected the deleted game to no longer be listed');
      }
    });
  });
  describe('HangmanGameUpdateAPI', () => {
    it('Checks the gameID before updating any values', async () => {
      const game1 = await createHangmanGameForTesting();
      expectGameListMatches(await apiClient.listHangmanGames(), game1);
      try {
        await apiClient.updateHangmanGame({
          gameID: game1.id.concat('1'),
          player2Id: nanoid(),
          player2Username: nanoid(),
        });
        fail('updateGame with an invalid gameID should throw an error');
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
        gameID: game1.id,
        player2Id: 'newId',
        player2Username: 'newName',
      });
      game1.player2ID = 'newId';
      game1.player2Username = 'newName';
      expectGameListMatches(await apiClient.listHangmanGames(), game1);
    });
  });
});

// describe('TTLGameServiceAPIREST', () => {
//   let server: http.Server;
//   let apiClient: TTLGameServiceClient;
//
//   async function createTownForTesting(friendlyNameToUse?: string, isPublic = false): Promise<TestTownData> {
//     const friendlyName = friendlyNameToUse !== undefined ? friendlyNameToUse :
//       `${isPublic ? 'Public' : 'Private'}TestingTown=${nanoid()}`;
//     const ret = await apiClient.createTown({
//       friendlyName,
//       isPubliclyListed: isPublic,
//     });
//     return {
//       friendlyName,
//       isPubliclyListed: isPublic,
//       coveyTownID: ret.coveyTownID,
//       townUpdatePassword: ret.coveyTownPassword,
//     };
//   }
//
//   beforeAll(async () => {
//     const app = Express();
//     app.use(CORS());
//     server = http.createServer(app);
//
//     addTownRoutes(server, app);
//     await server.listen();
//     const address = server.address() as AddressInfo;
//
//     apiClient = new TownsServiceClient(`http://127.0.0.1:${address.port}`);
//   });
//   afterAll(async () => {
//     await server.close();
//   });
//   describe('CoveyTownCreateAPI', () => {
//     it('Allows for multiple towns with the same friendlyName', async () => {
//       const firstTown = await createTownForTesting();
//       const secondTown = await createTownForTesting(firstTown.friendlyName);
//       expect(firstTown.coveyTownID)
//         .not
//         .toBe(secondTown.coveyTownID);
//     });
//     it('Prohibits a blank friendlyName', async () => {
//       try {
//         await createTownForTesting('');
//         fail('createTown should throw an error if friendly name is empty string');
//       } catch (err) {
//         // OK
//       }
//     });
//   });
//
//   describe('CoveyTownListAPI', () => {
//     it('Lists public towns, but not private towns', async () => {
//       const pubTown1 = await createTownForTesting(undefined, true);
//       const privTown1 = await createTownForTesting(undefined, false);
//       const pubTown2 = await createTownForTesting(undefined, true);
//       const privTown2 = await createTownForTesting(undefined, false);
//
//       const towns = await apiClient.listTowns();
//       expectTownListMatches(towns, pubTown1);
//       expectTownListMatches(towns, pubTown2);
//       expectTownListMatches(towns, privTown1);
//       expectTownListMatches(towns, privTown2);
//
//     });
//     it('Allows for multiple towns with the same friendlyName', async () => {
//       const pubTown1 = await createTownForTesting(undefined, true);
//       const privTown1 = await createTownForTesting(pubTown1.friendlyName, false);
//       const pubTown2 = await createTownForTesting(pubTown1.friendlyName, true);
//       const privTown2 = await createTownForTesting(pubTown1.friendlyName, false);
//
//       const towns = await apiClient.listTowns();
//       expectTownListMatches(towns, pubTown1);
//       expectTownListMatches(towns, pubTown2);
//       expectTownListMatches(towns, privTown1);
//       expectTownListMatches(towns, privTown2);
//     });
//   });
//
//   describe('CoveyTownDeleteAPI', () => {
//     it('Throws an error if the password is invalid', async () => {
//       const { coveyTownID } = await createTownForTesting(undefined, true);
//       try {
//         await apiClient.deleteTown({
//           coveyTownID,
//           coveyTownPassword: nanoid(),
//         });
//         fail('Expected deleteTown to throw an error');
//       } catch (e) {
//         // Expected error
//       }
//     });
//     it('Throws an error if the townID is invalid', async () => {
//       const { townUpdatePassword } = await createTownForTesting(undefined, true);
//       try {
//         await apiClient.deleteTown({
//           coveyTownID: nanoid(),
//           coveyTownPassword: townUpdatePassword,
//         });
//         fail('Expected deleteTown to throw an error');
//       } catch (e) {
//         // Expected error
//       }
//     });
//     it('Deletes a town if given a valid password and town, no longer allowing it to be joined or listed', async () => {
//       const { coveyTownID, townUpdatePassword } = await createTownForTesting(undefined, true);
//       await apiClient.deleteTown({
//         coveyTownID,
//         coveyTownPassword: townUpdatePassword,
//       });
//       try {
//         await apiClient.joinTown({
//           userName: nanoid(),
//           coveyTownID,
//         });
//         fail('Expected joinTown to throw an error');
//       } catch (e) {
//         // Expected
//       }
//       const listedTowns = await apiClient.listTowns();
//       if (listedTowns.towns.find(r => r.coveyTownID === coveyTownID)) {
//         fail('Expected the deleted town to no longer be listed');
//       }
//     });
//   });
//   describe('CoveyTownUpdateAPI', () => {
//     it('Checks the password before updating any values', async () => {
//       const pubTown1 = await createTownForTesting(undefined, true);
//       expectTownListMatches(await apiClient.listTowns(), pubTown1);
//       try {
//         await apiClient.updateTown({
//           coveyTownID: pubTown1.coveyTownID,
//           coveyTownPassword: `${pubTown1.townUpdatePassword}*`,
//           friendlyName: 'broken',
//           isPubliclyListed: false,
//         });
//         fail('updateTown with an invalid password should throw an error');
//       } catch (err) {
//         // err expected
//         // TODO this should really check to make sure it's the *right* error, but we didn't specify
//         // the format of the exception :(
//       }
//
//       // Make sure name or vis didn't change
//       expectTownListMatches(await apiClient.listTowns(), pubTown1);
//     });
//     it('Updates the friendlyName and visbility as requested', async () => {
//       const pubTown1 = await createTownForTesting(undefined, false);
//       expectTownListMatches(await apiClient.listTowns(), pubTown1);
//       await apiClient.updateTown({
//         coveyTownID: pubTown1.coveyTownID,
//         coveyTownPassword: pubTown1.townUpdatePassword,
//         friendlyName: 'newName',
//         isPubliclyListed: true,
//       });
//       pubTown1.friendlyName = 'newName';
//       pubTown1.isPubliclyListed = true;
//       expectTownListMatches(await apiClient.listTowns(), pubTown1);
//     });
//     it('Does not update the visibility if visibility is undefined', async () => {
//       const pubTown1 = await createTownForTesting(undefined, true);
//       expectTownListMatches(await apiClient.listTowns(), pubTown1);
//       await apiClient.updateTown({
//         coveyTownID: pubTown1.coveyTownID,
//         coveyTownPassword: pubTown1.townUpdatePassword,
//         friendlyName: 'newName2',
//       });
//       pubTown1.friendlyName = 'newName2';
//       expectTownListMatches(await apiClient.listTowns(), pubTown1);
//     });
//   });
//
//   describe('CoveyMemberAPI', () => {
//     it('Throws an error if the town does not exist', async () => {
//       await createTownForTesting(undefined, true);
//       try {
//         await apiClient.joinTown({
//           userName: nanoid(),
//           coveyTownID: nanoid(),
//         });
//         fail('Expected an error to be thrown by joinTown but none thrown');
//       } catch (err) {
//         // OK, expected an error
//         // TODO this should really check to make sure it's the *right* error, but we didn't specify
//         // the format of the exception :(
//       }
//     });
//     it('Admits a user to a valid public or private town', async () => {
//       const pubTown1 = await createTownForTesting(undefined, true);
//       const privTown1 = await createTownForTesting(undefined, false);
//       const res = await apiClient.joinTown({
//         userName: nanoid(),
//         coveyTownID: pubTown1.coveyTownID,
//       });
//       expect(res.coveySessionToken)
//         .toBeDefined();
//       expect(res.coveyUserID)
//         .toBeDefined();
//
//       const res2 = await apiClient.joinTown({
//         userName: nanoid(),
//         coveyTownID: privTown1.coveyTownID,
//       });
//       expect(res2.coveySessionToken)
//         .toBeDefined();
//       expect(res2.coveyUserID)
//         .toBeDefined();
//
//     });
//   });
// });
