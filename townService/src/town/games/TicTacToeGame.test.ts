import { createPlayerForTesting } from '../../TestUtils';
import {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  BOARD_POSITION_NOT_EMPTY_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import TicTacToeGame from './TicTacToeGame';
import Player from '../../lib/Player';
import { TicTacToeMove } from '../../types/CoveyTownSocket';

describe('TicTacToeGame', () => {
  let game: TicTacToeGame;

  beforeEach(() => {
    game = new TicTacToeGame();
  });

  describe('[T1.1] _join', () => {
    it('should throw an error if the player is already in the game', () => {
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.join(player)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
      const player2 = createPlayerForTesting();
      // TODO weaker test suite doesn't add this
      game.join(player2);
      expect(() => game.join(player2)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    });
    it('should throw an error if the game is full', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      const player3 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);

      expect(() => game.join(player3)).toThrowError(GAME_FULL_MESSAGE);
    });
    describe('When the player can be added', () => {
      it('makes the first player X and initializes the state with status WAITING_TO_START', () => {
        const player = createPlayerForTesting();
        game.join(player);
        expect(game.state.x).toEqual(player.id);
        expect(game.state.o).toBeUndefined();
        expect(game.state.moves).toHaveLength(0);
        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(game.state.winner).toBeUndefined();
      });
      describe('When the second player joins', () => {
        const player1 = createPlayerForTesting();
        const player2 = createPlayerForTesting();
        beforeEach(() => {
          game.join(player1);
          game.join(player2);
        });
        it('makes the second player O', () => {
          expect(game.state.x).toEqual(player1.id);
          expect(game.state.o).toEqual(player2.id);
        });
        it('sets the game status to IN_PROGRESS', () => {
          expect(game.state.status).toEqual('IN_PROGRESS');
          expect(game.state.winner).toBeUndefined();
          expect(game.state.moves).toHaveLength(0);
        });
      });
    });
  });
  describe('[T1.2] _leave', () => {
    it('should throw an error if the player is not in the game', () => {
      expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
      // TODO weaker test suite only does one of these - above or below
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
    });
    describe('when the player is in the game', () => {
      describe('when the game is in progress, it should set the game status to OVER and declare the other player the winner', () => {
        test('when x leaves', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          expect(game.state.x).toEqual(player1.id);
          expect(game.state.o).toEqual(player2.id);

          game.leave(player1);

          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(player2.id);
          expect(game.state.moves).toHaveLength(0);

          expect(game.state.x).toEqual(player1.id);
          expect(game.state.o).toEqual(player2.id);
        });
        test('when o leaves', () => {
          const player1 = createPlayerForTesting();
          const player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          expect(game.state.x).toEqual(player1.id);
          expect(game.state.o).toEqual(player2.id);

          game.leave(player2);

          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(player1.id);
          expect(game.state.moves).toHaveLength(0);

          expect(game.state.x).toEqual(player1.id);
          expect(game.state.o).toEqual(player2.id);
        });
      });
      it('when the game is not in progress, it should set the game status to WAITING_TO_START and remove the player', () => {
        const player1 = createPlayerForTesting();
        game.join(player1);
        expect(game.state.x).toEqual(player1.id);
        expect(game.state.o).toBeUndefined();
        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(game.state.winner).toBeUndefined();
        game.leave(player1);
        expect(game.state.x).toBeUndefined();
        expect(game.state.o).toBeUndefined();
        expect(game.state.status).toEqual('WAITING_TO_START');
        expect(game.state.winner).toBeUndefined();
      });
    });
  });
  describe('applyMove', () => {
    let moves: TicTacToeMove[] = [];

    describe('[T2.2] when given an invalid move', () => {
      it('should throw an error if the game is not in progress', () => {
        const player1 = createPlayerForTesting();
        game.join(player1);
        expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              row: 0,
              col: 0,
              gamePiece: 'X',
            },
          }),
        ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      });
      describe('when the game is in progress', () => {
        let player1: Player;
        let player2: Player;
        beforeEach(() => {
          player1 = createPlayerForTesting();
          player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          expect(game.state.status).toEqual('IN_PROGRESS');
        });
        it('should rely on the player ID to determine whose turn it is', () => {
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: player2.id,
              move: {
                row: 0,
                col: 0,
                gamePiece: 'X',
              },
            }),
          ).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: player1.id,
              move: {
                row: 0,
                col: 0,
                gamePiece: 'O',
              },
            }),
          ).not.toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
        });
        it('should throw an error if the move is out of turn for the player ID', () => {
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: player2.id,
              move: {
                row: 0,
                col: 0,
                gamePiece: 'X',
              },
            }),
          ).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              row: 0,
              col: 0,
              gamePiece: 'X',
            },
          });
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: player1.id,
              move: {
                row: 0,
                col: 1,
                gamePiece: 'X',
              },
            }),
          ).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
          // TODO this is a tricky one - the weaker test suite doesn't check that the player 2's move is out of turn after their first move
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move: {
              row: 0,
              col: 2,
              gamePiece: 'O',
            },
          });
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: player2.id,
              move: {
                row: 2,
                col: 1,
                gamePiece: 'O',
              },
            }),
          ).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
        });
        it('should throw an error if the move is on an occupied space', () => {
          const row = 0;
          const col = 0;
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              row,
              col,
              gamePiece: 'X',
            },
          });
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: player2.id,
              move: {
                row,
                col,
                gamePiece: 'O',
              },
            }),
          ).toThrowError(BOARD_POSITION_NOT_EMPTY_MESSAGE);
        });
        it('should not change whose turn it is when an invalid move is made', () => {
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              row: 1,
              col: 1,
              gamePiece: 'X',
            },
          });
          expect(() => {
            game.applyMove({
              gameID: game.id,
              playerID: player2.id,
              move: {
                row: 1,
                col: 1,
                gamePiece: 'O',
              },
            });
          }).toThrowError(BOARD_POSITION_NOT_EMPTY_MESSAGE);
          expect(game.state.moves).toHaveLength(1);
          game.applyMove({
            gameID: game.id,
            playerID: player2.id,
            move: {
              row: 1,
              col: 2,
              gamePiece: 'O',
            },
          });
          expect(game.state.moves).toHaveLength(2);
        });
        it('should not prevent the reuse of a space after an invalid move on it', () => {
          expect(() => {
            game.applyMove({
              gameID: game.id,
              playerID: player2.id,
              move: {
                row: 1,
                col: 1,
                gamePiece: 'O',
              },
            });
          }).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              row: 1,
              col: 1,
              gamePiece: 'X',
            },
          });
        });
      });
    });
    describe('when given a valid move', () => {
      let player1: Player;
      let player2: Player;
      let numMoves = 0;
      beforeEach(() => {
        player1 = createPlayerForTesting();
        player2 = createPlayerForTesting();
        numMoves = 0;
        moves = [];
        game.join(player1);
        game.join(player2);
        expect(game.state.status).toEqual('IN_PROGRESS');
      });
      function makeMoveAndCheckState(
        row: 0 | 1 | 2,
        col: 0 | 1 | 2,
        gamePiece: 'X' | 'O',
        expectedOutcome: 'WIN' | 'TIE' | undefined = undefined,
      ) {
        game.applyMove({
          gameID: game.id,
          playerID: gamePiece === 'X' ? player1.id : player2.id,
          move: {
            row,
            col,
            gamePiece,
          },
        });
        moves.push({ row, col, gamePiece });
        expect(game.state.moves).toHaveLength(++numMoves);
        for (let i = 0; i < numMoves; i++) {
          expect(game.state.moves[i]).toEqual(moves[i]);
        }
        if (expectedOutcome === 'WIN') {
          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toEqual(gamePiece === 'X' ? player1.id : player2.id);
        } else if (expectedOutcome === 'TIE') {
          expect(game.state.status).toEqual('OVER');
          expect(game.state.winner).toBeUndefined();
        } else {
          expect(game.state.status).toEqual('IN_PROGRESS');
          expect(game.state.winner).toBeUndefined();
        }
      }
      it('[T2.1] should add the move to the game state', () => {
        makeMoveAndCheckState(1, 2, 'X');
      });
      it('[T2.1] should not end the game if the move does not end the game', () => {
        makeMoveAndCheckState(1, 2, 'X');
        makeMoveAndCheckState(1, 0, 'O');
        makeMoveAndCheckState(0, 2, 'X');
        makeMoveAndCheckState(2, 2, 'O');
        makeMoveAndCheckState(1, 1, 'X');
        makeMoveAndCheckState(2, 0, 'O');
      });
      describe('[T2.3] when the move ends the game', () => {
        describe('it checks for winning conditions', () => {
          describe('a horizontal win', () => {
            test('x wins', () => {
              makeMoveAndCheckState(0, 0, 'X');
              makeMoveAndCheckState(1, 0, 'O');
              makeMoveAndCheckState(0, 1, 'X');
              makeMoveAndCheckState(1, 1, 'O');
              makeMoveAndCheckState(0, 2, 'X', 'WIN');
            });
            test('o wins', () => {
              makeMoveAndCheckState(0, 0, 'X');
              makeMoveAndCheckState(1, 0, 'O');
              makeMoveAndCheckState(0, 1, 'X');
              makeMoveAndCheckState(1, 1, 'O');
              makeMoveAndCheckState(2, 0, 'X');
              makeMoveAndCheckState(1, 2, 'O', 'WIN');
            });
          });
          describe('a vertical win', () => {
            test('x wins', () => {
              makeMoveAndCheckState(0, 0, 'X');
              makeMoveAndCheckState(0, 1, 'O');
              makeMoveAndCheckState(1, 0, 'X');
              makeMoveAndCheckState(1, 1, 'O');
              makeMoveAndCheckState(2, 0, 'X', 'WIN');
            });
            test('o wins', () => {
              makeMoveAndCheckState(0, 0, 'X');
              makeMoveAndCheckState(0, 1, 'O');
              makeMoveAndCheckState(1, 0, 'X');
              makeMoveAndCheckState(1, 1, 'O');
              makeMoveAndCheckState(2, 2, 'X');
              makeMoveAndCheckState(2, 1, 'O', 'WIN');
            });
          });
          describe('a diagonal win', () => {
            test('x wins', () => {
              makeMoveAndCheckState(0, 0, 'X');
              makeMoveAndCheckState(0, 1, 'O');
              makeMoveAndCheckState(1, 1, 'X');
              makeMoveAndCheckState(1, 2, 'O');
              makeMoveAndCheckState(2, 2, 'X', 'WIN');
            });
            test('o wins', () => {
              makeMoveAndCheckState(0, 1, 'X');
              makeMoveAndCheckState(0, 0, 'O');
              makeMoveAndCheckState(1, 0, 'X');
              makeMoveAndCheckState(1, 1, 'O');
              makeMoveAndCheckState(2, 0, 'X');
              makeMoveAndCheckState(2, 2, 'O', 'WIN');
            });
            test('other diagonal - x wins', () => {
              makeMoveAndCheckState(0, 2, 'X');
              makeMoveAndCheckState(0, 1, 'O');
              makeMoveAndCheckState(1, 1, 'X');
              makeMoveAndCheckState(1, 2, 'O');
              makeMoveAndCheckState(2, 0, 'X', 'WIN');
            });
            test('other diagonal - o wins', () => {
              makeMoveAndCheckState(0, 1, 'X');
              makeMoveAndCheckState(0, 2, 'O');
              makeMoveAndCheckState(1, 0, 'X');
              makeMoveAndCheckState(1, 1, 'O');
              makeMoveAndCheckState(2, 1, 'X');
              makeMoveAndCheckState(2, 0, 'O', 'WIN');
            });
          });
        });
        it('declares a tie if there are no winning conditions but the board is full', () => {
          makeMoveAndCheckState(0, 0, 'X');
          makeMoveAndCheckState(0, 1, 'O');
          makeMoveAndCheckState(0, 2, 'X');
          makeMoveAndCheckState(2, 0, 'O');
          makeMoveAndCheckState(1, 1, 'X');
          makeMoveAndCheckState(1, 2, 'O');
          makeMoveAndCheckState(1, 0, 'X');
          makeMoveAndCheckState(2, 2, 'O');
          makeMoveAndCheckState(2, 1, 'X', 'TIE');
        });
      });
    });
  });
});
