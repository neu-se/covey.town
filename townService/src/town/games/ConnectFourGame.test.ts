import { Console } from 'console';
import {
  BOARD_POSITION_NOT_VALID_MESSAGE,
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  GAME_NOT_STARTABLE_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import { createPlayerForTesting } from '../../TestUtils';
import {
  ConnectFourColIndex,
  ConnectFourColor,
  ConnectFourRowIndex,
} from '../../types/CoveyTownSocket';
import ConnectFourGame from './ConnectFourGame';

type ConnectFourPattern = ('Y' | 'R' | '_')[][];
type ConnectFourBoardTest = {
  board: ConnectFourPattern;
  expectedWinner: ConnectFourColor | undefined;
};
const logger = new Console(process.stdout, process.stderr);
/**
 * A helper function to apply a pattern of moves to a game.
 * The pattern is a 2-d array of Y, R or _.
 * Y and R indicate that a move should be made by the yellow or red player respectively.
 * _ indicates that no move should be made.
 * The pattern is applied from the bottom left to the top right, going across the rows
 *
 * Note that there are valid game boards that *can not* be created by this function, as it does not
 * search for all possible orderings of applying the moves. It might get stuck in a situation where
 * it can't make a move, because it hasn't made the move that would allow it to make the next move.
 *
 * If it fails, it will print to the console the pattern and the moves that were made, and throw an error.
 *
 * @param game Game to apply the pattern to
 * @param pattern Board pattern to apply
 * @param redID ID of the red player
 * @param yellowID ID of the yellow player
 * @param firstColor The color of the first player to make a move
 */
function createMovesFromPattern(
  game: ConnectFourGame,
  pattern: string[][],
  redID: string,
  yellowID: string,
  firstColor: ConnectFourColor,
) {
  type QueuedMove = { rowIdx: ConnectFourRowIndex; colIdx: ConnectFourColIndex };
  const queues = {
    Yellow: [] as QueuedMove[],
    Red: [] as QueuedMove[],
  };

  // Construct the queues of moves to make from the board pattern
  pattern.forEach((row, rowIdx) => {
    row.forEach((col, colIdx) => {
      if (col === 'Y') {
        queues.Yellow.push({
          rowIdx: rowIdx as ConnectFourRowIndex,
          colIdx: colIdx as ConnectFourColIndex,
        });
      } else if (col === 'R') {
        queues.Red.push({
          rowIdx: rowIdx as ConnectFourRowIndex,
          colIdx: colIdx as ConnectFourColIndex,
        });
      } else if (col !== '_') {
        throw new Error(`Invalid pattern: ${pattern}, expecting 2-d array of Y, R or _`);
      }
    });
  });

  // sort the queue so that the moves are made from the left to the right, then bottom to up
  const queueSorter = (a: QueuedMove, b: QueuedMove) => {
    function cellNumber(move: QueuedMove) {
      return 6 * (5 - move.rowIdx) + move.colIdx;
    }
    return cellNumber(a) - cellNumber(b);
  };
  queues.Yellow.sort(queueSorter);
  queues.Red.sort(queueSorter);

  const colHeights = [5, 5, 5, 5, 5, 5, 5];
  const movesMade: string[][] = [[], [], [], [], [], []];
  // Helper function to make a move
  const makeMove = (color: ConnectFourColor) => {
    // Finds the first move in the queue that can be made and makes it
    const queue = queues[color];
    if (queue.length === 0) return;
    for (const move of queue) {
      if (move.rowIdx === colHeights[move.colIdx]) {
        // we can make this!
        game.applyMove({
          gameID: game.id,
          move: {
            gamePiece: color,
            col: move.colIdx,
            row: move.rowIdx,
          },
          playerID: color === 'Red' ? redID : yellowID,
        });
        movesMade[move.rowIdx][move.colIdx] = color === 'Red' ? 'R' : 'Y';
        queues[color] = queue.filter(m => m !== move);
        colHeights[move.colIdx] -= 1;
        return;
      }
    }
    // If we get here, we couldn't make any moves
    logger.table(pattern);
    logger.table(movesMade);
    throw new Error(
      `Unable to apply pattern: ${JSON.stringify(pattern, null, 2)}
      If this is a pattern in the autograder: are you sure that you checked for game-ending conditions? If this is a pattern you provided: please double-check your pattern - it may be invalid.`,
    );
  };
  const gameOver = () => game.state.status === 'OVER';
  while (queues.Yellow.length > 0 || queues.Red.length > 0) {
    // Try to make a move for the first player in the queue
    makeMove(firstColor);
    // If the game is over, return
    if (gameOver()) return;

    // Try to make a move for the second player in the queue
    makeMove(firstColor === 'Red' ? 'Yellow' : 'Red');
    if (gameOver()) return;
  }
}

describe('ConnectFourGame', () => {
  let game: ConnectFourGame;
  beforeEach(() => {
    game = new ConnectFourGame();
  });
  describe('[T1.1] _join', () => {
    it('should throw an error if the player is already in the game', () => {
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.join(player)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
      const player2 = createPlayerForTesting();
      game.join(player2);
      expect(() => game.join(player2)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    });
    it('should throw an error if the player is not in the game and the game is full', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      const player3 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);

      expect(() => game.join(player3)).toThrowError(GAME_FULL_MESSAGE);
    });
    // Tests above are provided
    describe('if the player is not in the game and the game is not full', () => {
      describe('if the player was not the yellow in the last game', () => {
        it('should add the player as red if red is empty', () => {
          const red = createPlayerForTesting();
          game.join(red);
          expect(game.state.red).toBe(red.id);
          expect(game.state.yellow).toBeUndefined();
          expect(game.state.redReady).toBeFalsy();
          expect(game.state.yellowReady).toBeFalsy();
          expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
        });
        it('should add the player as yellow if red is present', () => {
          const red = createPlayerForTesting();
          const yellow = createPlayerForTesting();
          game.join(red);
          expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
          game.join(yellow);
          expect(game.state.red).toBe(red.id);
          expect(game.state.yellow).toBe(yellow.id);
          expect(game.state.redReady).toBeFalsy();
          expect(game.state.yellowReady).toBeFalsy();
          expect(game.state.status).toBe('WAITING_TO_START');
        });
      });
      describe('if the player was yellow in the last game', () => {
        it('should add the player as yellow if yellow is empty', () => {
          const red = createPlayerForTesting();
          const yellow = createPlayerForTesting();
          game.join(red);
          game.join(yellow);
          expect(game.state.red).toBe(red.id); // First player should be red
          expect(game.state.yellow).toBe(yellow.id); // Second player should be yellow
          // Now, make a new game with the state of the last one
          const secondGame = new ConnectFourGame(game);
          expect(secondGame.state.red).toBeUndefined();
          expect(secondGame.state.yellow).toBeUndefined();
          secondGame.join(yellow);
          expect(secondGame.state.red).toBe(undefined);
          expect(secondGame.state.yellow).toBe(yellow.id);
          const newRed = createPlayerForTesting();
          secondGame.join(newRed);
          expect(secondGame.state.red).toBe(newRed.id);
        });
      });
      it('should set the status to WAITING_TO_START if both players are present', () => {
        const red = createPlayerForTesting();
        const yellow = createPlayerForTesting();
        game.join(red);
        game.join(yellow);
        expect(game.state.status).toBe('WAITING_TO_START');
        expect(game.state.redReady).toBeFalsy();
        expect(game.state.yellowReady).toBeFalsy();
      });
    });
  });
  describe('[T1.2] _startGame', () => {
    test('if the status is not WAITING_TO_START, it throws an error', () => {
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.startGame(player)).toThrowError(GAME_NOT_STARTABLE_MESSAGE);
    });
    test('if the player is not in the game, it throws an error', () => {
      game.join(createPlayerForTesting());
      game.join(createPlayerForTesting());
      expect(() => game.startGame(createPlayerForTesting())).toThrowError(
        PLAYER_NOT_IN_GAME_MESSAGE,
      );
    });
    describe('if the player is in the game', () => {
      const red = createPlayerForTesting();
      const yellow = createPlayerForTesting();
      beforeEach(() => {
        game.join(red);
        game.join(yellow);
      });
      test('if the player is red, it sets redReady to true', () => {
        game.startGame(red);
        expect(game.state.redReady).toBe(true);
        expect(game.state.yellowReady).toBeFalsy();
        expect(game.state.status).toBe('WAITING_TO_START');
      });
      test('if the player is yellow, it sets yellowReady to true', () => {
        game.startGame(yellow);
        expect(game.state.redReady).toBeFalsy();
        expect(game.state.yellowReady).toBe(true);
        expect(game.state.status).toBe('WAITING_TO_START');
      });
      test('if both players are ready, it sets the status to IN_PROGRESS', () => {
        game.startGame(red);
        game.startGame(yellow);
        expect(game.state.redReady).toBe(true);
        expect(game.state.yellowReady).toBe(true);
        expect(game.state.status).toBe('IN_PROGRESS');
      });
      test('if a player already reported ready, it does not change the status or throw an error', () => {
        game.startGame(red);
        game.startGame(red);
        expect(game.state.redReady).toBe(true);
        expect(game.state.yellowReady).toBeFalsy();
        expect(game.state.status).toBe('WAITING_TO_START');
      });
      test('if there are not any players from a prior game, it always sets the first player to red when the game starts', () => {
        // create conditions where the first player *would* be yellow
        game.startGame(red);
        game.startGame(yellow);
        game.leave(red);
        expect(game.state.status).toBe('OVER');

        const secondGame = new ConnectFourGame(game);
        secondGame.join(red);
        expect(secondGame.state.red).toBe(red.id);
        const newYellow = createPlayerForTesting();
        secondGame.join(newYellow);
        expect(secondGame.state.yellow).toBe(newYellow.id);
        secondGame.leave(red);

        // Now, there are no longer players from the last game.
        const newRed = createPlayerForTesting();
        secondGame.join(newRed);
        secondGame.startGame(newYellow);
        secondGame.startGame(newRed);
        expect(secondGame.state.firstPlayer).toBe('Red');
      });
      test('if there are players from a prior game, it sets the first player to the player who was not first in the last game', () => {
        game.startGame(red);
        game.startGame(yellow);
        game.leave(red);

        const secondGame = new ConnectFourGame(game);
        const newRed = createPlayerForTesting();
        secondGame.join(newRed);
        secondGame.join(yellow);
        secondGame.startGame(newRed);
        secondGame.startGame(yellow);
        expect(secondGame.state.firstPlayer).toBe('Yellow');
      });
    });
  });
  describe('[T1.3] _leave', () => {
    it('should throw an error if the player is not in the game', () => {
      const player = createPlayerForTesting();
      expect(() => game.leave(player)).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
      game.join(player);
      expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
    });
    describe('when the player is in the game', () => {
      describe('when the game is in progress', () => {
        test('if the player is red, it sets the winner to yellow and status to OVER', () => {
          const red = createPlayerForTesting();
          const yellow = createPlayerForTesting();
          game.join(red);
          game.join(yellow);
          game.startGame(red);
          game.startGame(yellow);
          game.leave(red);
          expect(game.state.winner).toBe(yellow.id);
          expect(game.state.status).toBe('OVER');
        });
        test('if the player is yellow, it sets the winner to red and status to OVER', () => {
          const red = createPlayerForTesting();
          const yellow = createPlayerForTesting();
          game.join(red);
          game.join(yellow);
          game.startGame(red);
          game.startGame(yellow);
          game.leave(yellow);
          expect(game.state.winner).toBe(red.id);
          expect(game.state.status).toBe('OVER');
        });
      });
      test('when the game is already over before the player leaves, it does not update the state', () => {
        const red = createPlayerForTesting();
        const yellow = createPlayerForTesting();
        game.join(red);
        game.join(yellow);
        game.startGame(red);
        game.startGame(yellow);
        expect(game.state.yellow).toBe(yellow.id);
        expect(game.state.red).toBe(red.id);
        game.leave(red);
        expect(game.state.status).toBe('OVER');
        const stateBeforeLeaving = { ...game.state };
        game.leave(yellow);
        expect(game.state).toEqual(stateBeforeLeaving);
      });
      describe('when the game is waiting to start, with status WAITING_TO_START', () => {
        test('if the player is red, it sets red to undefined and status to WAITING_FOR_PLAYERS', () => {
          const red = createPlayerForTesting();
          const yellow = createPlayerForTesting();
          game.join(red);
          expect(game.state.redReady).toBeFalsy();
          game.join(yellow);
          game.startGame(red);
          expect(game.state.redReady).toBeTruthy();
          game.leave(red);
          expect(game.state.redReady).toBeFalsy();
          expect(game.state.red).toBeUndefined();
          expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
        });
        test('if the player is yellow, it sets yellow to undefined and status to WAITING_FOR_PLAYERS', () => {
          const red = createPlayerForTesting();
          const yellow = createPlayerForTesting();
          game.join(red);
          game.join(yellow);
          expect(game.state.yellowReady).toBeFalsy();
          game.startGame(yellow);
          expect(game.state.yellowReady).toBeTruthy();
          game.leave(yellow);
          expect(game.state.yellowReady).toBeFalsy();
          expect(game.state.yellow).toBeUndefined();
          expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
        });
        test('if the player is red, and the "preferred yellow" player joins, it should add the player as red', () => {
          const red = createPlayerForTesting();
          const yellow = createPlayerForTesting();
          game.join(red);
          game.join(yellow);

          expect(game.state.red).toBe(red.id); // First player should be red
          expect(game.state.yellow).toBe(yellow.id); // Second player should be yellow
          expect(game.state.redReady).toBeFalsy();
          expect(game.state.yellowReady).toBeFalsy();
          expect(game.state.status).toBe('WAITING_TO_START');

          // Now, make a new game with the state of the last one
          const secondGame = new ConnectFourGame(game);
          expect(secondGame.state.red).toBeUndefined();
          expect(secondGame.state.yellow).toBeUndefined();

          const newRed = createPlayerForTesting();
          secondGame.join(newRed);
          expect(secondGame.state.red).toBe(newRed.id);
          const newYellow = createPlayerForTesting();
          secondGame.join(newYellow);
          expect(secondGame.state.yellow).toBe(newYellow.id);
          secondGame.leave(newRed);
          secondGame.join(yellow);
          expect(secondGame.state.red).toBe(yellow.id);
          expect(secondGame.state.yellow).toBe(newYellow.id);
        });
      });
      describe('when the game is waiting for players, in state WAITING_FOR_PLAYERS', () => {
        test('if the player is red, it sets red to undefined, redReady to false and status remains WAITING_FOR_PLAYERS', () => {
          const red = createPlayerForTesting();
          game.join(red);
          expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
          game.leave(red);
          expect(game.state.red).toBeUndefined();
          expect(game.state.redReady).toBeFalsy();
          expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
        });
        test('if the player is yellow, it sets yellow to undefined, yellowReady to false and status remains WAITING_FOR_PLAYERS', () => {
          const red = createPlayerForTesting();
          const yellow = createPlayerForTesting();
          game.join(red);
          game.join(yellow);
          game.leave(red);
          const secondGame = new ConnectFourGame(game);
          secondGame.join(yellow);
          expect(secondGame.state.yellow).toBe(yellow.id);
          expect(secondGame.state.status).toBe('WAITING_FOR_PLAYERS');
          secondGame.leave(yellow);
          expect(secondGame.state.yellow).toBeUndefined();
          expect(secondGame.state.yellowReady).toBeFalsy();
          expect(secondGame.state.status).toBe('WAITING_FOR_PLAYERS');
        });
      });
    });
  });
  describe('applyMove', () => {
    const red = createPlayerForTesting();
    const yellow = createPlayerForTesting();
    beforeEach(() => {
      game.join(red);
      game.join(yellow);
      game.startGame(red);
      game.startGame(yellow);
    });

    describe('[T2.1] Determining who is the first player', () => {
      test('If there is no prior game, the first player is red', () => {
        expect(game.state.firstPlayer).toEqual('Red');
      });
      test('If there is a prior game, and both players join this one, then the first player is the player who was NOT first in the last game', () => {
        expect(game.state.firstPlayer).toEqual('Red');
        const game2 = new ConnectFourGame(game);
        game2.join(red);
        game2.join(yellow);
        game2.startGame(red);
        game2.startGame(yellow);
        expect(game2.state.firstPlayer).toEqual('Yellow');
      });
      test('If there is a prior game, and only one player joins this one, then that player will be first if they were NOT first in the last game', () => {
        expect(game.state.firstPlayer).toEqual('Red');
        const game2 = new ConnectFourGame(game);
        const newPlayer = createPlayerForTesting();
        game2.join(newPlayer);
        game2.join(yellow);
        game2.startGame(newPlayer);
        game2.startGame(yellow);
        expect(game2.state.firstPlayer).toEqual('Yellow');

        const game3 = new ConnectFourGame(game2);
        const newPlayer2 = createPlayerForTesting();
        game3.join(newPlayer2);
        game3.join(yellow);
        game3.startGame(newPlayer2);
        game3.startGame(yellow);
        expect(game3.state.firstPlayer).toEqual('Red');
      });
    });
    describe('[T2.2] when given a valid move', () => {
      it.each([0, 1, 2, 3, 4, 5, 6])(
        'should add the move to the game state in column %d and not end the game',
        (col: number) => {
          game.applyMove({
            gameID: game.id,
            playerID: red.id,
            move: { gamePiece: 'Red', col: col as ConnectFourColIndex, row: 5 },
          });
          expect(game.state.moves[0]).toEqual({
            gamePiece: 'Red',
            col: col as ConnectFourColIndex,
            row: 5,
          });
          expect(game.state.status).toBe('IN_PROGRESS');
        },
      );
      it.each([0, 1, 2, 3, 4, 5])(
        'should permit stacking the moves in column %d and not end the game if the move does not win',
        (col: number) => {
          // Stack red, yellow, red, yellow, red, yellow
          for (let i = 0; i < 3; i++) {
            game.applyMove({
              gameID: game.id,
              playerID: red.id,
              move: {
                gamePiece: 'Red',
                col: col as ConnectFourColIndex,
                row: (5 - 2 * i) as ConnectFourRowIndex,
              },
            });
            game.applyMove({
              gameID: game.id,
              playerID: yellow.id,
              move: {
                gamePiece: 'Yellow',
                col: col as ConnectFourColIndex,
                row: (4 - 2 * i) as ConnectFourRowIndex,
              },
            });
          }
          // validate
          for (let i = 0; i < 3; i++) {
            expect(game.state.moves[2 * i]).toEqual({
              gamePiece: 'Red',
              col: col as ConnectFourColIndex,
              row: (5 - 2 * i) as ConnectFourRowIndex,
            });
            expect(game.state.moves[2 * i + 1]).toEqual({
              gamePiece: 'Yellow',
              col: col as ConnectFourColIndex,
              row: (4 - 2 * i) as ConnectFourRowIndex,
            });
          }
          expect(game.state.status).toBe('IN_PROGRESS');
        },
      );
    });
    describe('[T2.3] when given a move that wins the game, it ends the game and declares the winner', () => {
      test('horizontal wins in the first row', () => {
        createMovesFromPattern(
          game,
          [[], [], [], [], [], ['Y', 'Y', 'Y', 'R', 'R', 'R', 'R']],
          red.id,
          yellow.id,
          'Red',
        );
        expect(game.state.status).toBe('OVER');
        expect(game.state.winner).toBe(red.id);

        const secondGame = new ConnectFourGame(game);
        secondGame.join(red);
        secondGame.join(yellow);
        secondGame.startGame(red);
        secondGame.startGame(yellow);
        createMovesFromPattern(
          secondGame,
          [
            [],
            [],
            [],
            [],
            ['R', 'R', 'R', 'Y', 'R', 'R', 'R'],
            ['Y', 'Y', 'R', 'Y', 'Y', 'Y', 'Y'],
          ],
          red.id,
          yellow.id,
          'Yellow',
        );
        /**
         * create this pattern:
         * W W W W L L L
         */
        const thirdGame = new ConnectFourGame(secondGame);
        thirdGame.join(red);
        thirdGame.join(yellow);
        thirdGame.startGame(red);
        thirdGame.startGame(yellow);
        createMovesFromPattern(
          thirdGame,
          [[], [], [], [], ['R', 'R', 'R'], ['Y', 'Y', 'Y', 'Y', 'R', 'R', 'R']],
          red.id,
          yellow.id,
          'Red',
        );
      });
      test('horizontal wins in the top row', () => {
        const pattern = [
          ['R', 'R', 'R', 'R', 'Y', 'Y', 'Y'],
          ['Y', 'R', 'Y', 'Y', 'R', 'Y', 'Y'],
          ['R', 'Y', 'Y', 'Y', 'R', 'R', 'R'],
          ['Y', 'R', 'Y', 'Y', 'R', 'Y', 'Y'],
          ['Y', 'R', 'R', 'R', 'Y', 'R', 'R'],
          ['Y', 'R', 'Y', 'Y', 'R', 'R', 'R'],
        ];
        createMovesFromPattern(game, pattern, red.id, yellow.id, 'Red');
        expect(game.state.status).toBe('OVER');
        expect(game.state.winner).toBe(red.id);
      });
      test('horizontal wins right aligned', () => {
        const pattern = [
          ['Y', 'Y', 'Y', 'R', 'R', 'R', 'R'],
          ['Y', 'R', 'Y', 'Y', 'R', 'Y', 'Y'],
          ['R', 'Y', 'R', 'Y', 'Y', 'R', 'R'],
          ['Y', 'R', 'Y', 'Y', 'R', 'Y', 'Y'],
          ['Y', 'R', 'R', 'R', 'Y', 'R', 'R'],
          ['Y', 'R', 'Y', 'Y', 'R', 'R', 'R'],
        ];
        createMovesFromPattern(game, pattern, red.id, yellow.id, 'Red');
        expect(game.state.status).toBe('OVER');
        expect(game.state.winner).toBe(red.id);
      });
      test('vertical wins', () => {
        // In the first column
        const pattern = [[], [], ['R'], ['R'], ['R', 'Y'], ['R', 'Y', 'Y', 'Y']];
        createMovesFromPattern(game, pattern, red.id, yellow.id, 'Red');
        expect(game.state.status).toBe('OVER');
        expect(game.state.winner).toBe(red.id);
        // In the last column
        const secondGame = new ConnectFourGame(game);
        secondGame.join(red);
        secondGame.join(yellow);
        secondGame.startGame(red);
        secondGame.startGame(yellow);
        const secondPattern = [
          [],
          [],
          ['_', '_', '_', '_', '_', 'Y'],
          ['_', '_', '_', '_', '_', 'Y'],
          ['_', '_', '_', '_', '_', 'Y'],
          ['R', 'R', 'R', 'Y', 'R', 'Y'],
        ];
        createMovesFromPattern(secondGame, secondPattern, red.id, yellow.id, 'Yellow');
        expect(secondGame.state.status).toBe('OVER');
        expect(secondGame.state.winner).toBe(yellow.id);
      });

      test.each<ConnectFourBoardTest>([
        {
          board:
            // Board with diagonal win from bottom left up
            [
              ['_', '_', '_', '_', '_', '_', '_'],
              ['_', '_', '_', '_', '_', '_', '_'],
              ['_', '_', 'Y', 'R', '_', '_', '_'],
              ['_', '_', 'R', 'R', '_', '_', '_'],
              ['_', 'R', 'Y', 'Y', '_', '_', '_'],
              ['R', 'R', 'Y', 'Y', '_', '_', '_'],
            ],
          expectedWinner: 'Red',
        },
        {
          board:
            // Board with diagonal win from bottom left up
            [
              ['_', '_', '_', '_', '_', 'R', 'Y'],
              ['_', '_', '_', '_', '_', 'Y', 'R'],
              ['_', '_', '_', '_', 'Y', 'Y', 'R'],
              ['_', '_', '_', 'Y', 'R', 'Y', 'R'],
              ['_', '_', '_', 'R', 'Y', 'R', 'Y'],
              ['_', '_', '_', 'Y', 'R', 'R', 'R'],
            ],
          expectedWinner: 'Yellow',
        },
        {
          board:
            // Board with diagonal win from bottom left up, aligned with right column
            [
              ['_', '_', '_', '_', '_', 'R', 'Y'],
              ['_', '_', '_', '_', '_', 'Y', 'R'],
              ['_', '_', '_', '_', 'R', 'Y', 'Y'],
              ['_', '_', '_', 'Y', 'R', 'Y', 'R'],
              ['_', '_', '_', 'R', 'Y', 'R', 'Y'],
              ['_', '_', '_', 'Y', 'R', 'R', 'R'],
            ],
          expectedWinner: 'Yellow',
        },
        {
          board:
            // Board with diagonal win from top left to bottom right
            [
              [],
              ['Y', 'R', 'Y', 'R', 'Y'],
              ['Y', 'R', 'R', 'Y', 'Y'],
              ['R', 'Y', 'Y', 'Y', 'R'],
              ['R', 'R', 'Y', 'Y', 'R'],
              ['R', 'Y', 'Y', 'Y', 'R'],
            ],
          expectedWinner: 'Yellow',
        },
        {
          board:
            // Board with diagonal win from top left to bottom right
            [
              ['_', '_', '_', '_', '_', '_', '_'],
              ['_', '_', '_', '_', '_', '_', '_'],
              ['_', '_', '_', 'Y', '_', '_', '_'],
              ['_', '_', '_', 'R', 'Y', '_', '_'],
              ['_', '_', '_', 'R', 'R', 'Y', '_'],
              ['_', '_', '_', 'Y', 'R', 'R', 'Y'],
            ],
          expectedWinner: 'Yellow',
        },
      ])('diagonal wins', ({ board, expectedWinner }) => {
        createMovesFromPattern(game, board, red.id, yellow.id, 'Red');
        expect(game.state.status).toBe('OVER');
        expect(game.state.winner).toBe(expectedWinner === 'Red' ? red.id : yellow.id);
      });
    });
    describe('[T2.3] when given a move that does not win the game, it does not end it', () => {
      test('Near-win horizontally', () => {
        createMovesFromPattern(
          game,
          [
            ['_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_'],
            ['_', 'Y', 'Y', 'Y', '_', '_', '_'],
            ['_', 'R', 'R', 'R', '_', '_', '_'],
          ],
          red.id,
          yellow.id,
          'Red',
        );
        expect(game.state.status).toBe('IN_PROGRESS');
        expect(game.state.winner).toBeUndefined();
      });
      test('Near-win vertically', () => {
        createMovesFromPattern(
          game,
          [
            ['_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_'],
            ['R', 'Y', '_', '_', '_', '_', '_'],
            ['R', 'Y', '_', '_', '_', '_', '_'],
            ['R', 'Y', '_', '_', '_', '_', '_'],
          ],
          red.id,
          yellow.id,
          'Red',
        );
        expect(game.state.status).toBe('IN_PROGRESS');
        expect(game.state.winner).toBeUndefined();
      });
      test.each<ConnectFourBoardTest>([
        {
          board: [
            ['_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', '_', '_', '_', '_', '_'],
            ['_', '_', 'R', 'Y', '_', '_', '_'],
            ['Y', 'R', 'R', 'Y', '_', '_', '_'],
            ['R', 'Y', 'R', 'Y', '_', '_', '_'],
          ],
          expectedWinner: undefined,
        },
        {
          board: [
            ['R', 'Y', '_', '_', '_', '_', '_'],
            ['Y', 'R', '_', '_', '_', '_', '_'],
            ['Y', 'R', 'Y', 'R', '_', '_', '_'],
            ['R', 'Y', 'Y', 'R', '_', '_', '_'],
            ['Y', 'R', 'R', 'Y', '_', '_', '_'],
            ['R', 'Y', 'R', 'R', 'Y', '_', '_'],
          ],
          expectedWinner: undefined,
        },
      ])('Near-win diagonally', ({ board }) => {
        createMovesFromPattern(game, board, red.id, yellow.id, 'Red');
        expect(game.state.status).toBe('IN_PROGRESS');
        expect(game.state.winner).toBeUndefined();
      });
    });
    it('[T2.3] should declare a tie if the board is full and no one has won', () => {
      createMovesFromPattern(
        game,
        [
          ['Y', 'R', 'R', 'R', 'Y', 'R', 'Y'],
          ['Y', 'R', 'Y', 'Y', 'R', 'Y', 'Y'],
          ['R', 'Y', 'Y', 'Y', 'R', 'R', 'R'],
          ['Y', 'R', 'Y', 'Y', 'R', 'Y', 'Y'],
          ['Y', 'R', 'R', 'R', 'Y', 'R', 'R'],
          ['Y', 'R', 'Y', 'Y', 'R', 'R', 'R'],
        ],
        red.id,
        yellow.id,
        'Red',
      );
      expect(game.state.status).toBe('OVER');
      expect(game.state.winner).toBeUndefined();
    });
  });
  describe('[T2.4] when given an invalid move request', () => {
    it('throws an error if the game is not in progress', () => {
      const player = createPlayerForTesting();
      game.join(player);
      expect(() =>
        game.applyMove({
          gameID: game.id,
          playerID: player.id,
          move: { gamePiece: 'Red', col: 0, row: 0 },
        }),
      ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
    });
    describe('when the game is in progress', () => {
      const red = createPlayerForTesting();
      const yellow = createPlayerForTesting();
      beforeEach(() => {
        game.join(red);
        game.join(yellow);
        game.startGame(red);
        game.startGame(yellow);
      });
      it('should throw an error if the player is not in the game', () => {
        const otherPlayer = createPlayerForTesting();
        expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: otherPlayer.id,
            move: { gamePiece: 'Red', col: 0, row: 5 },
          }),
        ).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
      });
      describe('when the player is in the game', () => {
        it('should throw an error if the player is not the active player', () => {
          // Test with Red as first player
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: yellow.id,
              move: { gamePiece: 'Yellow', col: 0, row: 5 },
            }),
          ).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);

          // Test with Yellow as first player
          const secondGame = new ConnectFourGame(game);
          secondGame.join(red);
          secondGame.join(yellow);
          secondGame.startGame(yellow);
          secondGame.startGame(red);
          expect(() =>
            secondGame.applyMove({
              gameID: secondGame.id,
              playerID: red.id,
              move: { gamePiece: 'Red', col: 0, row: 5 },
            }),
          ).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
        });
        it('should throw an error if the cell is not at the bottom of the column', () => {
          createMovesFromPattern(
            game,
            [
              ['_', '_', '_', '_', '_', '_'],
              ['_', '_', '_', '_', '_', '_'],
              ['_', '_', '_', '_', '_', '_'],
              ['Y', '_', '_', '_', '_', '_'],
              ['R', '_', '_', '_', '_', '_'],
              ['R', 'Y', '_', '_', '_', '_'],
            ],
            red.id,
            yellow.id,
            'Red',
          );
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: red.id,
              move: { gamePiece: 'Red', col: 0, row: 1 },
            }),
          ).toThrowError(BOARD_POSITION_NOT_VALID_MESSAGE);
        });
        it('should throw an error if the cell is full', () => {
          createMovesFromPattern(
            game,
            [
              ['Y', '_', '_', '_', '_', '_'],
              ['R', '_', '_', '_', '_', '_'],
              ['Y', '_', '_', '_', '_', '_'],
              ['R', '_', '_', '_', '_', '_'],
              ['Y', '_', '_', '_', '_', '_'],
              ['R', '_', '_', '_', '_', '_'],
            ],
            red.id,
            yellow.id,
            'Red',
          );
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: red.id,
              move: { gamePiece: 'Red', col: 0, row: 0 },
            }),
          ).toThrowError(BOARD_POSITION_NOT_VALID_MESSAGE);
        });
        it('should not change the game state', () => {
          createMovesFromPattern(
            game,
            [
              ['Y', '_', '_', '_', '_', '_'],
              ['R', '_', '_', '_', '_', '_'],
              ['Y', '_', '_', '_', '_', '_'],
              ['R', '_', '_', '_', '_', '_'],
              ['Y', '_', '_', '_', '_', '_'],
              ['R', '_', '_', '_', '_', '_'],
            ],
            red.id,
            yellow.id,
            'Red',
          );
          expect(game.state.moves.length).toBe(6);
          expect(() =>
            game.applyMove({
              gameID: game.id,
              playerID: red.id,
              move: { gamePiece: 'Red', col: 0, row: 0 },
            }),
          ).toThrowError(BOARD_POSITION_NOT_VALID_MESSAGE);
          expect(game.state.moves.length).toBe(6);
          game.applyMove({
            gameID: game.id,
            playerID: red.id,
            move: { gamePiece: 'Red', col: 1, row: 5 },
          });
          expect(game.state.moves.length).toBe(7);
        });
      });
    });
  });
});
