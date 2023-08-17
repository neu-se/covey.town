import { createPlayerForTesting } from '../../TestUtils';
import Player from '../../lib/Player';
import { TicTacToeMove } from '../../types/CoveyTownSocket';
import TicTacToeGame from './TicTacToeGame';

describe('TicTacToeGame', () => {
  let game: TicTacToeGame;

  beforeEach(() => {
    game = new TicTacToeGame();
  });

  describe('[T1.1] _join', () => {
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
    });
    describe('[T1.2] _leave', () => {
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
        });
      });
    });
    describe('applyMove', () => {
      describe('when given a valid move', () => {
        let player1: Player;
        let player2: Player;
        beforeEach(() => {
          player1 = createPlayerForTesting();
          player2 = createPlayerForTesting();
          game.join(player1);
          game.join(player2);
          expect(game.state.status).toEqual('IN_PROGRESS');
        });
        it('[T2.1] should add the move to the game state', () => {
          const move: TicTacToeMove = { row: 1, col: 2, gamePiece: 'X' };
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move,
          });
          expect(game.state.moves).toHaveLength(1);
          expect(game.state.moves[0]).toEqual(move);
          expect(game.state.status).toEqual('IN_PROGRESS');
        });
      });
    });
  });
});
