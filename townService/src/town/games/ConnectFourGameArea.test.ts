import { nanoid } from 'nanoid';
import { mock } from 'jest-mock-extended';
import Player from '../../lib/Player';
import {
  ConnectFourColor,
  ConnectFourGameState,
  ConnectFourMove,
  GameInstanceID,
  GameMove,
  TownEmitter,
} from '../../types/CoveyTownSocket';
import ConnectFourGame from './ConnectFourGame';
import ConnectFourGameArea from './ConnectFourGameArea';
import * as ConnectFourGameModule from './ConnectFourGame';
import Game from './Game';
import { createPlayerForTesting } from '../../TestUtils';
import {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_COMMAND_MESSAGE,
} from '../../lib/InvalidParametersError';

class TestingGame extends Game<ConnectFourGameState, ConnectFourMove> {
  public constructor(priorGame?: ConnectFourGame) {
    super({
      moves: [],
      status: 'WAITING_TO_START',
      firstPlayer: 'Red',
    });
  }

  public applyMove(move: GameMove<ConnectFourMove>): void {}

  public endGame(winner?: string) {
    this.state = {
      ...this.state,
      status: 'OVER',
      winner,
    };
  }

  public startGame(player: Player) {
    if (this.state.red === player.id) this.state.redReady = true;
    else this.state.yellowReady = true;
  }

  protected _join(player: Player): void {
    if (this.state.red) this.state.yellow = player.id;
    else this.state.red = player.id;
    this._players.push(player);
  }

  protected _leave(player: Player): void {}
}
describe('ConnectFourGameArea', () => {
  let gameArea: ConnectFourGameArea;
  let red: Player;
  let yellow: Player;
  let interactableUpdateSpy: jest.SpyInstance;
  const gameConstructorSpy = jest.spyOn(ConnectFourGameModule, 'default');
  let game: TestingGame;

  beforeEach(() => {
    gameConstructorSpy.mockClear();
    game = new TestingGame();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Testing without using the real game class)
    gameConstructorSpy.mockReturnValue(game);

    red = createPlayerForTesting();
    yellow = createPlayerForTesting();
    gameArea = new ConnectFourGameArea(
      nanoid(),
      { x: 0, y: 0, width: 100, height: 100 },
      mock<TownEmitter>(),
    );
    gameArea.add(red);
    game.join(red);
    gameArea.add(yellow);
    game.join(yellow);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Test requires access to protected method)
    interactableUpdateSpy = jest.spyOn(gameArea, '_emitAreaChanged');
  });

  describe('[T3.1] JoinGame command', () => {
    test('when there is no existing game, it should create a new game and call _emitAreaChanged', () => {
      expect(gameArea.game).toBeUndefined();
      const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, red);
      expect(gameArea.game).toBeDefined();
      expect(gameID).toEqual(game.id);
      expect(interactableUpdateSpy).toHaveBeenCalled();
    });
    test('when there is a game that just ended, it should create a new game and call _emitAreaChanged', () => {
      expect(gameArea.game).toBeUndefined();

      gameConstructorSpy.mockClear();
      const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, red);
      expect(gameArea.game).toBeDefined();
      expect(gameID).toEqual(game.id);
      expect(interactableUpdateSpy).toHaveBeenCalled();
      expect(gameConstructorSpy).toHaveBeenCalledTimes(1);
      game.endGame();

      gameConstructorSpy.mockClear();
      const { gameID: newGameID } = gameArea.handleCommand({ type: 'JoinGame' }, red);
      expect(gameArea.game).toBeDefined();
      expect(newGameID).toEqual(game.id);
      expect(interactableUpdateSpy).toHaveBeenCalled();
      expect(gameConstructorSpy).toHaveBeenCalledTimes(1);
    });
    describe('when there is a game in progress', () => {
      it('should call join on the game and call _emitAreaChanged', () => {
        const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, red);
        if (!game) {
          throw new Error('Game was not created by the first call to join');
        }
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);

        const joinSpy = jest.spyOn(game, 'join');
        const gameID2 = gameArea.handleCommand({ type: 'JoinGame' }, yellow).gameID;
        expect(joinSpy).toHaveBeenCalledWith(yellow);
        expect(gameID).toEqual(gameID2);
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
      });
      it('should not call _emitAreaChanged if the game throws an error', () => {
        gameArea.handleCommand({ type: 'JoinGame' }, red);
        if (!game) {
          throw new Error('Game was not created by the first call to join');
        }
        interactableUpdateSpy.mockClear();

        const joinSpy = jest.spyOn(game, 'join').mockImplementationOnce(() => {
          throw new Error('Test Error');
        });
        expect(() => gameArea.handleCommand({ type: 'JoinGame' }, yellow)).toThrowError(
          'Test Error',
        );
        expect(joinSpy).toHaveBeenCalledWith(yellow);
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
    });
  });
  describe('[T3.2] StartGame command', () => {
    it('when there is no game, it should throw an error and not call _emitAreaChanged', () => {
      expect(() =>
        gameArea.handleCommand({ type: 'StartGame', gameID: nanoid() }, red),
      ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
    });
    describe('when there is a game in progress', () => {
      it('should call startGame on the game and call _emitAreaChanged', () => {
        const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, red);
        interactableUpdateSpy.mockClear();
        gameArea.handleCommand({ type: 'StartGame', gameID }, yellow);
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
      });
      it('should not call _emitAreaChanged if the game throws an error', () => {
        gameArea.handleCommand({ type: 'JoinGame' }, red);
        if (!game) {
          throw new Error('Game was not created by the first call to join');
        }
        interactableUpdateSpy.mockClear();

        const startSpy = jest.spyOn(game, 'startGame').mockImplementationOnce(() => {
          throw new Error('Test Error');
        });
        expect(() =>
          gameArea.handleCommand({ type: 'StartGame', gameID: game.id }, yellow),
        ).toThrowError('Test Error');
        expect(startSpy).toHaveBeenCalledWith(yellow);
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
      test('when the game ID mismatches, it should throw an error and not call _emitAreaChanged', () => {
        gameArea.handleCommand({ type: 'JoinGame' }, red);
        if (!game) {
          throw new Error('Game was not created by the first call to join');
        }
        expect(() =>
          gameArea.handleCommand({ type: 'StartGame', gameID: nanoid() }, red),
        ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
      });
    });
  });
  describe('[T3.3] GameMove command', () => {
    it('should throw an error if there is no game in progress and not call _emitAreaChanged', () => {
      interactableUpdateSpy.mockClear();

      expect(() =>
        gameArea.handleCommand(
          { type: 'GameMove', move: { col: 0, row: 0, gamePiece: 'X' }, gameID: nanoid() },
          red,
        ),
      ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      expect(interactableUpdateSpy).not.toHaveBeenCalled();
    });
    describe('when there is a game in progress', () => {
      let gameID: GameInstanceID;
      beforeEach(() => {
        gameID = gameArea.handleCommand({ type: 'JoinGame' }, red).gameID;
        gameArea.handleCommand({ type: 'JoinGame' }, yellow);
        interactableUpdateSpy.mockClear();
      });
      it('should throw an error if the gameID does not match the game and not call _emitAreaChanged', () => {
        expect(() =>
          gameArea.handleCommand(
            { type: 'GameMove', move: { col: 0, row: 0, gamePiece: 'Yellow' }, gameID: nanoid() },
            red,
          ),
        ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
      });
      it('should call applyMove on the game and call _emitAreaChanged', () => {
        const move: ConnectFourMove = { col: 0, row: 0, gamePiece: 'Red' };
        const applyMoveSpy = jest.spyOn(game, 'applyMove');
        gameArea.handleCommand({ type: 'GameMove', move, gameID }, red);
        expect(applyMoveSpy).toHaveBeenCalledWith({
          gameID: game.id,
          playerID: red.id,
          move: {
            ...move,
            gamePiece: 'Red',
          },
        });
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
      });
      it('should not call _emitAreaChanged if the game throws an error', () => {
        const move: ConnectFourMove = { col: 0, row: 0, gamePiece: 'Red' };
        const applyMoveSpy = jest.spyOn(game, 'applyMove');
        applyMoveSpy.mockImplementationOnce(() => {
          throw new Error('Test Error');
        });
        expect(() => gameArea.handleCommand({ type: 'GameMove', move, gameID }, red)).toThrowError(
          'Test Error',
        );
        expect(applyMoveSpy).toHaveBeenCalledWith({
          gameID: game.id,
          playerID: red.id,
          move: {
            ...move,
            gamePiece: 'Red',
          },
        });
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
      describe('when the game ends', () => {
        test.each<ConnectFourColor>(['Red', 'Yellow'])(
          'when the game is won by %p',
          (winner: ConnectFourColor) => {
            const finalMove: ConnectFourMove = { col: 0, row: 0, gamePiece: 'Red' };
            jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
              game.endGame(winner === 'Red' ? red.id : yellow.id);
            });
            gameArea.handleCommand({ type: 'GameMove', move: finalMove, gameID }, red);
            expect(game.state.status).toEqual('OVER');
            expect(gameArea.history.length).toEqual(1);
            const winningUsername = winner === 'Red' ? red.userName : yellow.userName;
            const losingUsername = winner === 'Red' ? yellow.userName : red.userName;
            expect(gameArea.history[0]).toEqual({
              gameID: game.id,
              scores: {
                [winningUsername]: 1,
                [losingUsername]: 0,
              },
            });
            expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
          },
        );
        test('when the game results in a tie', () => {
          const finalMove: ConnectFourMove = { col: 0, row: 0, gamePiece: 'Red' };
          jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
            game.endGame();
          });
          gameArea.handleCommand({ type: 'GameMove', move: finalMove, gameID }, red);
          expect(game.state.status).toEqual('OVER');
          expect(gameArea.history.length).toEqual(1);
          expect(gameArea.history[0]).toEqual({
            gameID: game.id,
            scores: {
              [red.userName]: 0,
              [yellow.userName]: 0,
            },
          });
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
        });
      });
    });
  });
  describe('[T3.4] LeaveGame command', () => {
    it('should throw an error if there is no game in progress and not call _emitAreaChanged', () => {
      expect(() =>
        gameArea.handleCommand({ type: 'LeaveGame', gameID: nanoid() }, red),
      ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      expect(interactableUpdateSpy).not.toHaveBeenCalled();
    });
    describe('when there is a game in progress', () => {
      it('should throw an error if the gameID does not match the game and not call _emitAreaChanged', () => {
        gameArea.handleCommand({ type: 'JoinGame' }, red);
        interactableUpdateSpy.mockClear();
        expect(() =>
          gameArea.handleCommand({ type: 'LeaveGame', gameID: nanoid() }, red),
        ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
      it('should call leave on the game and call _emitAreaChanged', () => {
        const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, red);
        if (!game) {
          throw new Error('Game was not created by the first call to join');
        }
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
        const leaveSpy = jest.spyOn(game, 'leave');
        gameArea.handleCommand({ type: 'LeaveGame', gameID }, red);
        expect(leaveSpy).toHaveBeenCalledWith(red);
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
      });
      it('should not call _emitAreaChanged if the game throws an error', () => {
        gameArea.handleCommand({ type: 'JoinGame' }, red);
        if (!game) {
          throw new Error('Game was not created by the first call to join');
        }
        interactableUpdateSpy.mockClear();
        const leaveSpy = jest.spyOn(game, 'leave').mockImplementationOnce(() => {
          throw new Error('Test Error');
        });
        expect(() =>
          gameArea.handleCommand({ type: 'LeaveGame', gameID: game.id }, red),
        ).toThrowError('Test Error');
        expect(leaveSpy).toHaveBeenCalledWith(red);
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
      test.each<ConnectFourColor>(['Red', 'Yellow'])(
        'when the game is won by %p, it updates the history',
        (playerThatWins: ConnectFourColor) => {
          const leavingPlayer = playerThatWins === 'Red' ? yellow : red;
          const winningPlayer = playerThatWins === 'Red' ? red : yellow;

          const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, red);
          gameArea.handleCommand({ type: 'JoinGame' }, yellow);

          interactableUpdateSpy.mockClear();

          jest.spyOn(game, 'leave').mockImplementationOnce(() => {
            game.endGame(winningPlayer.id);
          });
          gameArea.handleCommand({ type: 'LeaveGame', gameID }, leavingPlayer);
          expect(game.state.status).toEqual('OVER');
          expect(gameArea.history.length).toEqual(1);
          const winningUsername = winningPlayer.userName;
          const losingUsername = leavingPlayer.userName;

          expect(gameArea.history[0]).toEqual({
            gameID: game.id,
            scores: {
              [winningUsername]: 1,
              [losingUsername]: 0,
            },
          });
          expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
        },
      );
    });
  });
  test('[T3.5] When given an invalid command it should throw an error', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Testing an invalid command, only possible at the boundary of the type system)
    expect(() => gameArea.handleCommand({ type: 'InvalidCommand' }, red)).toThrowError(
      INVALID_COMMAND_MESSAGE,
    );
    expect(interactableUpdateSpy).not.toHaveBeenCalled();
  });
});
