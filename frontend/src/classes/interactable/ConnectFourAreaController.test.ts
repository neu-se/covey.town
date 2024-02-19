import assert from 'assert';
import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import {
  ConnectFourColIndex,
  ConnectFourColor,
  ConnectFourMove,
  ConnectFourRowIndex,
  GameResult,
  GameStatus,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TownController from '../TownController';
import ConnectFourAreaController, {
  COLUMN_FULL_MESSAGE,
  CONNECT_FOUR_COLS,
  CONNECT_FOUR_ROWS,
} from './ConnectFourAreaController';
import GameAreaController, { NO_GAME_IN_PROGRESS_ERROR } from './GameAreaController';

describe('ConnectFourAreaController', () => {
  const ourPlayer = new PlayerController(nanoid(), nanoid(), {
    x: 0,
    y: 0,
    moving: false,
    rotation: 'front',
  });
  const otherPlayers = [
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
  ];

  const mockTownController = mock<TownController>();
  Object.defineProperty(mockTownController, 'ourPlayer', {
    get: () => ourPlayer,
  });
  Object.defineProperty(mockTownController, 'players', {
    get: () => [ourPlayer, ...otherPlayers],
  });
  mockTownController.getPlayer.mockImplementation(playerID => {
    const p = mockTownController.players.find(player => player.id === playerID);
    assert(p);
    return p;
  });

  function updateGameWithMove(
    controller: ConnectFourAreaController,
    nextMove: ConnectFourMove,
  ): void {
    const nextState = Object.assign({}, controller.toInteractableAreaModel());
    const nextGame = Object.assign({}, nextState.game);
    nextState.game = nextGame;
    const newState = Object.assign({}, nextGame.state);
    nextGame.state = newState;
    newState.moves = newState.moves.concat([nextMove]);
    controller.updateFrom(nextState, controller.occupants);
  }
  function connectFourAreaControllerWithProps({
    _id,
    history,
    red,
    yellow,
    undefinedGame,
    status,
    moves,
    gameInstanceID,
    winner,
    firstPlayer,
    observers,
  }: {
    _id?: string;
    history?: GameResult[];
    red?: string;
    yellow?: string;
    undefinedGame?: boolean;
    status?: GameStatus;
    gameInstanceID?: string;
    moves?: ConnectFourMove[];
    winner?: string;
    firstPlayer?: ConnectFourColor;
    observers?: string[];
  }) {
    const id = _id || `INTERACTABLE-ID-${nanoid()}`;
    const instanceID = gameInstanceID || `GAME-INSTANCE-ID-${nanoid()}`;
    const players = [];
    if (red) players.push(red);
    if (yellow) players.push(yellow);
    if (observers) players.push(...observers);
    const ret = new ConnectFourAreaController(
      id,
      {
        id,
        occupants: players,
        history: history || [],
        type: 'ConnectFourArea',
        game: undefinedGame
          ? undefined
          : {
              id: instanceID,
              players: players,
              state: {
                status: status || 'IN_PROGRESS',
                red: red,
                yellow: yellow,
                moves: moves || [],
                winner: winner,
                firstPlayer: firstPlayer || 'Red',
              },
            },
      },
      mockTownController,
    );
    if (players) {
      ret.occupants = players
        .map(eachID => mockTownController.players.find(eachPlayer => eachPlayer.id === eachID))
        .filter(eachPlayer => eachPlayer) as PlayerController[];
    }
    return ret;
  }
  describe('[T1.1] Properties at the start of the game', () => {
    describe('board', () => {
      it('returns an empty board if there are no moves yet', () => {
        const controller = connectFourAreaControllerWithProps({ status: 'IN_PROGRESS', moves: [] });
        //Expect correct number of rows
        expect(controller.board.length).toBe(CONNECT_FOUR_ROWS);
        for (let i = 0; i < CONNECT_FOUR_ROWS; i++) {
          //Expect correct number of columns
          expect(controller.board[i].length).toBe(CONNECT_FOUR_COLS);
          for (let j = 0; j < CONNECT_FOUR_COLS; j++) {
            //Expect each cell to be empty
            expect(controller.board[i][j]).toBeUndefined();
          }
        }
      });
    });
    describe('red', () => {
      it('returns the red player if there is a red player', () => {
        const controller = connectFourAreaControllerWithProps({ red: ourPlayer.id });
        expect(controller.red).toBe(ourPlayer);
      });
      it('returns undefined if there is no red player', () => {
        const controller = connectFourAreaControllerWithProps({ red: undefined });
        expect(controller.red).toBeUndefined();
      });
    });
    describe('yellow', () => {
      it('returns the yellow player if there is a yellow player', () => {
        const controller = connectFourAreaControllerWithProps({ yellow: ourPlayer.id });
        expect(controller.yellow).toBe(ourPlayer);
      });
      it('returns undefined if there is no yellow player', () => {
        const controller = connectFourAreaControllerWithProps({ yellow: undefined });
        expect(controller.yellow).toBeUndefined();
      });
    });
    describe('winner', () => {
      it('returns the winner if there is a winner', () => {
        const controller = connectFourAreaControllerWithProps({
          yellow: ourPlayer.id,
          winner: ourPlayer.id,
        });
        expect(controller.winner).toBe(ourPlayer);
      });
      it('returns undefined if there is no winner', () => {
        const controller = connectFourAreaControllerWithProps({ winner: undefined });
        expect(controller.winner).toBeUndefined();
      });
    });
    describe('moveCount', () => {
      it('returns the number of moves from the game state', () => {
        const controller = connectFourAreaControllerWithProps({
          moves: [
            { col: 0, gamePiece: 'Red', row: 0 },
            { col: 1, gamePiece: 'Yellow', row: 0 },
          ],
        });
        expect(controller.moveCount).toBe(2);
      });
    });
    describe('isOurTurn', () => {
      it('returns true if it is our turn', () => {
        const controller = connectFourAreaControllerWithProps({
          red: ourPlayer.id,
          firstPlayer: 'Red',
          status: 'IN_PROGRESS',
          yellow: otherPlayers[0].id,
        });
        expect(controller.isOurTurn).toBe(true);
      });
      it('returns false if it is not our turn', () => {
        const controller = connectFourAreaControllerWithProps({
          red: ourPlayer.id,
          firstPlayer: 'Yellow',
          status: 'IN_PROGRESS',
          yellow: otherPlayers[0].id,
        });
        expect(controller.isOurTurn).toBe(false);
      });
    });
    describe('whoseTurn', () => {
      it('returns red if the first player is red', () => {
        const controller = connectFourAreaControllerWithProps({
          red: ourPlayer.id,
          firstPlayer: 'Red',
          status: 'IN_PROGRESS',
          yellow: otherPlayers[0].id,
        });
        expect(controller.whoseTurn).toBe(controller.red);
      });
      it('returns yellow if the first player is yellow', () => {
        const controller = connectFourAreaControllerWithProps({
          red: ourPlayer.id,
          firstPlayer: 'Yellow',
          status: 'IN_PROGRESS',
          yellow: otherPlayers[0].id,
        });
        expect(controller.whoseTurn).toBe(controller.yellow);
      });
    });
    describe('isPlayer', () => {
      it('returns true if we are a player', () => {
        const controller = connectFourAreaControllerWithProps({ red: ourPlayer.id });
        expect(controller.isPlayer).toBe(true);
      });
      it('returns false if we are not a player', () => {
        const controller = connectFourAreaControllerWithProps({ red: undefined });
        expect(controller.isPlayer).toBe(false);
      });
    });
    describe('gamePiece', () => {
      it('returns Red if we are red', () => {
        const controller = connectFourAreaControllerWithProps({ red: ourPlayer.id });
        expect(controller.gamePiece).toBe('Red');
      });
      it('returns Yellow if we are yellow', () => {
        const controller = connectFourAreaControllerWithProps({ yellow: ourPlayer.id });
        expect(controller.gamePiece).toBe('Yellow');
      });
      it('throws an error if we are not a player', () => {
        const controller = connectFourAreaControllerWithProps({ red: undefined });
        expect(() => controller.gamePiece).toThrowError();
      });
    });
    describe('isEmpty', () => {
      it('returns true if there are no players', () => {
        const controller = connectFourAreaControllerWithProps({ red: undefined });
        expect(controller.isEmpty()).toBe(true);
      });
      it('returns false if there is a single red player', () => {
        const controller = connectFourAreaControllerWithProps({ red: ourPlayer.id });
        expect(controller.isEmpty()).toBe(false);
      });
      it('returns false if there is a single yellow player', () => {
        const controller = connectFourAreaControllerWithProps({ yellow: ourPlayer.id });
        expect(controller.isEmpty()).toBe(false);
      });
      it('returns false if there are multiple players', () => {
        const controller = connectFourAreaControllerWithProps({
          red: ourPlayer.id,
          yellow: otherPlayers[0].id,
        });
        expect(controller.isEmpty()).toBe(false);
      });
      it('returns false if there are no players but there are observers', () => {
        const controller = connectFourAreaControllerWithProps({ observers: [ourPlayer.id] });
        expect(controller.isEmpty()).toBe(false);
      });
    });
    describe('isActive', () => {
      it('returns true if the game is not empty and it is not waiting for players', () => {
        const controller = connectFourAreaControllerWithProps({
          red: ourPlayer.id,
          yellow: otherPlayers[0].id,
          status: 'IN_PROGRESS',
        });
        expect(controller.isActive()).toBe(true);
      });
      it('returns false if the game is empty', () => {
        const controller = connectFourAreaControllerWithProps({
          red: undefined,
          status: 'IN_PROGRESS',
        });
        expect(controller.isActive()).toBe(false);
      });
      it('returns false if the game is waiting for players', () => {
        const controller = connectFourAreaControllerWithProps({
          red: ourPlayer.id,
          yellow: otherPlayers[0].id,
          status: 'WAITING_FOR_PLAYERS',
        });
        expect(controller.isActive()).toBe(false);
      });
    });
  });
  describe('[T1.2] Properties during the game, modified by _updateFrom ', () => {
    let controller: ConnectFourAreaController;
    beforeEach(() => {
      controller = connectFourAreaControllerWithProps({
        red: ourPlayer.id,
        yellow: otherPlayers[0].id,
        status: 'IN_PROGRESS',
      });
    });
    it('returns the correct board after a move', () => {
      updateGameWithMove(controller, { col: 0, gamePiece: 'Red', row: 0 });
      expect(controller.board[0][0]).toBe('Red');
      updateGameWithMove(controller, {
        col: (CONNECT_FOUR_COLS - 1) as ConnectFourColIndex,
        gamePiece: 'Yellow',
        row: (CONNECT_FOUR_ROWS - 1) as ConnectFourRowIndex,
      });
      expect(controller.board[0][0]).toBe('Red');
      expect(controller.board[CONNECT_FOUR_ROWS - 1][CONNECT_FOUR_COLS - 1]).toBe('Yellow');
      //Also check that the rest are still undefined
      for (let i = 0; i < CONNECT_FOUR_ROWS; i++) {
        for (let j = 0; j < CONNECT_FOUR_COLS; j++) {
          if (
            !((i === 0 && j == 0) || (i == CONNECT_FOUR_ROWS - 1 && j === CONNECT_FOUR_COLS - 1))
          ) {
            expect(controller.board[i][j]).toBeUndefined();
          }
        }
      }
    });
    it('emits a boardChange event if the board has changed', () => {
      const spy = jest.fn();
      controller.addListener('boardChanged', spy);
      updateGameWithMove(controller, { col: 0, gamePiece: 'Red', row: 0 });
      expect(spy).toHaveBeenCalledWith(controller.board);
    });
    it('does not emit a boardChange event if the board has not changed', () => {
      const spy = jest.fn();
      controller.addListener('boardChanged', spy);
      controller.updateFrom(
        { ...controller.toInteractableAreaModel() },
        otherPlayers.concat(ourPlayer),
      );
      expect(spy).not.toHaveBeenCalled();
    });
    it('Calls super.updateFrom with the correct parameters', () => {
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore - we are testing spying on a private method
      const spy = jest.spyOn(GameAreaController.prototype, '_updateFrom');
      const model = controller.toInteractableAreaModel();
      controller.updateFrom(model, otherPlayers.concat(ourPlayer));
      expect(spy).toHaveBeenCalledWith(model);
    });
    describe('updating whoseTurn and isOurTurn', () => {
      describe('When Red goes first and we are red', () => {
        beforeEach(() => {
          controller = connectFourAreaControllerWithProps({
            red: ourPlayer.id,
            yellow: otherPlayers[0].id,
            status: 'IN_PROGRESS',
            firstPlayer: 'Red',
          });
        });
        it("returns Red and true if it is Red's turn", () => {
          updateGameWithMove(controller, { col: 0, gamePiece: 'Red', row: 0 });
          updateGameWithMove(controller, { col: 0, gamePiece: 'Yellow', row: 0 });
          expect(controller.whoseTurn).toBe(ourPlayer);
          expect(controller.isOurTurn).toBe(true);
        });
        it("returns Yellow and false if it is Yellow's turn", () => {
          updateGameWithMove(controller, { col: 0, gamePiece: 'Red', row: 0 });
          expect(controller.whoseTurn).toBe(otherPlayers[0]);
          expect(controller.isOurTurn).toBe(false);
        });
      });
      describe('When Red goes first and we are yellow', () => {
        beforeEach(() => {
          controller = connectFourAreaControllerWithProps({
            yellow: ourPlayer.id,
            red: otherPlayers[0].id,
            status: 'IN_PROGRESS',
            firstPlayer: 'Red',
          });
        });
        it("returns Red and false if it is Red's turn", () => {
          updateGameWithMove(controller, { col: 0, gamePiece: 'Red', row: 0 });
          updateGameWithMove(controller, { col: 0, gamePiece: 'Yellow', row: 0 });
          expect(controller.whoseTurn).toBe(otherPlayers[0]);
          expect(controller.isOurTurn).toBe(false);
        });
        it("returns Yellow and true if it is Yellow's turn", () => {
          updateGameWithMove(controller, { col: 0, gamePiece: 'Red', row: 0 });
          expect(controller.whoseTurn).toBe(ourPlayer);
          expect(controller.isOurTurn).toBe(true);
        });
      });
      describe('When Yellow goes first and we are yellow', () => {
        beforeEach(() => {
          controller = connectFourAreaControllerWithProps({
            yellow: ourPlayer.id,
            red: otherPlayers[0].id,
            status: 'IN_PROGRESS',
            firstPlayer: 'Yellow',
          });
        });
        it('returns Yellow and true if it is Yellow turn', () => {
          updateGameWithMove(controller, { col: 0, gamePiece: 'Yellow', row: 0 });
          updateGameWithMove(controller, { col: 0, gamePiece: 'Red', row: 0 });
          expect(controller.whoseTurn).toBe(ourPlayer);
          expect(controller.isOurTurn).toBe(true);
        });
        it('returns Red and false if it is Red turn', () => {
          updateGameWithMove(controller, { col: 0, gamePiece: 'Yellow', row: 0 });
          expect(controller.whoseTurn).toBe(otherPlayers[0]);
          expect(controller.isOurTurn).toBe(false);
        });
      });
      describe('When Yellow goes first and we are red', () => {
        beforeEach(() => {
          controller = connectFourAreaControllerWithProps({
            red: ourPlayer.id,
            yellow: otherPlayers[0].id,
            status: 'IN_PROGRESS',
            firstPlayer: 'Yellow',
          });
        });
        it('returns Yellow and false if it is Yellow turn', () => {
          updateGameWithMove(controller, { col: 0, gamePiece: 'Yellow', row: 0 });
          updateGameWithMove(controller, { col: 0, gamePiece: 'Red', row: 0 });
          expect(controller.whoseTurn).toBe(otherPlayers[0]);
          expect(controller.isOurTurn).toBe(false);
        });
        it('returns Red and true if it is Red turn', () => {
          updateGameWithMove(controller, { col: 0, gamePiece: 'Yellow', row: 0 });
          expect(controller.whoseTurn).toBe(ourPlayer);
          expect(controller.isOurTurn).toBe(true);
        });
      });
    });
    describe('emitting turnChanged events', () => {
      it('emits a turnChanged event if the turn has changed', () => {
        expect(controller.isOurTurn).toBe(true);
        const spy = jest.fn();
        controller.addListener('turnChanged', spy);
        updateGameWithMove(controller, { col: 0, gamePiece: 'Red', row: 0 });
        expect(controller.isOurTurn).toBe(false);
        expect(spy).toHaveBeenCalledWith(false);
        spy.mockClear();
        updateGameWithMove(controller, { col: 0, gamePiece: 'Yellow', row: 0 });
        expect(controller.isOurTurn).toBe(true);
        expect(spy).toHaveBeenCalledWith(true);
      });
      it('does not emit a turnChanged event if the turn has not changed', () => {
        expect(controller.isOurTurn).toBe(true);
        const spy = jest.fn();
        controller.addListener('turnChanged', spy);
        controller.updateFrom(controller.toInteractableAreaModel(), [ourPlayer, otherPlayers[0]]);
        expect(spy).not.toHaveBeenCalled();
      });
    });
  });

  describe('[T1.3] startGame', () => {
    it('sends a StartGame command to the server', async () => {
      const controller = connectFourAreaControllerWithProps({
        red: ourPlayer.id,
        yellow: otherPlayers[0].id,
        status: 'WAITING_TO_START',
      });
      const instanceID = nanoid();
      mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
        return { gameID: instanceID };
      });
      await controller.joinGame();

      mockTownController.sendInteractableCommand.mockClear();
      mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {});
      await controller.startGame();
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(controller.id, {
        type: 'StartGame',
        gameID: instanceID,
      });
    });
    it('Does not catch any errors from the server', async () => {
      const controller = connectFourAreaControllerWithProps({
        red: ourPlayer.id,
        yellow: otherPlayers[0].id,
        status: 'WAITING_TO_START',
      });
      const instanceID = nanoid();
      mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
        return { gameID: instanceID };
      });
      await controller.joinGame();

      mockTownController.sendInteractableCommand.mockClear();
      const uniqueError = `Test Error ${nanoid()}`;
      mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
        throw new Error(uniqueError);
      });
      await expect(() => controller.startGame()).rejects.toThrowError(uniqueError);
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(controller.id, {
        type: 'StartGame',
        gameID: instanceID,
      });
    });
    it('throws an error if the game is not startable', async () => {
      const controller = connectFourAreaControllerWithProps({
        red: ourPlayer.id,
        yellow: otherPlayers[0].id,
        status: 'IN_PROGRESS',
      });
      const instanceID = nanoid();
      mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
        return { gameID: instanceID };
      });
      await controller.joinGame();
      mockTownController.sendInteractableCommand.mockClear();
      await expect(controller.startGame()).rejects.toThrowError();
      expect(mockTownController.sendInteractableCommand).not.toHaveBeenCalled();
    });
    it('throws an error if there is no instanceid', async () => {
      const controller = connectFourAreaControllerWithProps({
        red: ourPlayer.id,
        yellow: otherPlayers[0].id,
        status: 'WAITING_TO_START',
      });
      mockTownController.sendInteractableCommand.mockClear();
      await expect(controller.startGame()).rejects.toThrowError();
      expect(mockTownController.sendInteractableCommand).not.toHaveBeenCalled();
    });
  });
  describe('[T1.4] makeMove', () => {
    describe('With no game in progress', () => {
      it('Throws an error if there is no game', async () => {
        const controller = connectFourAreaControllerWithProps({
          red: ourPlayer.id,
          yellow: otherPlayers[0].id,
          undefinedGame: true,
        });
        await expect(() => controller.makeMove(0)).rejects.toThrowError(NO_GAME_IN_PROGRESS_ERROR);
      });
      it('Throws an error if game status is not IN_PROGRESS', async () => {
        const controller = connectFourAreaControllerWithProps({
          red: ourPlayer.id,
          yellow: otherPlayers[0].id,
          status: 'WAITING_TO_START',
        });
        await expect(() => controller.makeMove(0)).rejects.toThrowError(NO_GAME_IN_PROGRESS_ERROR);
      });
    });
    describe('With a game in progress', () => {
      let controller: ConnectFourAreaController;
      let instanceID: string;
      beforeEach(async () => {
        instanceID = `GameInstanceID.makeMove.${nanoid()}`;
        controller = connectFourAreaControllerWithProps({
          red: ourPlayer.id,
          yellow: otherPlayers[0].id,
          status: 'IN_PROGRESS',
          gameInstanceID: instanceID,
        });
        mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
          return { gameID: instanceID };
        });
        await controller.joinGame();
      });
      describe('Setting the row of the move', () => {
        async function makeMoveAndExpectRowPlacement(
          col: ConnectFourColIndex,
          expectedRow: number,
        ) {
          mockTownController.sendInteractableCommand.mockClear();
          await controller.makeMove(col);
          expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(controller.id, {
            type: 'GameMove',
            gameID: instanceID,
            move: {
              col,
              row: expectedRow as ConnectFourRowIndex,
              gamePiece: controller.gamePiece,
            },
          });
          //Update the controller with the new move
          updateGameWithMove(controller, {
            col,
            row: expectedRow as ConnectFourRowIndex,
            gamePiece: controller.gamePiece,
          });
        }
        it('Places the game piece in the bottom row if the column is empty', async () => {
          await makeMoveAndExpectRowPlacement(0, CONNECT_FOUR_ROWS - 1);
          await makeMoveAndExpectRowPlacement(1, CONNECT_FOUR_ROWS - 1);
          await makeMoveAndExpectRowPlacement(
            (CONNECT_FOUR_COLS - 1) as ConnectFourColIndex,
            CONNECT_FOUR_ROWS - 1,
          );
        });
        it('Stacks game pieces up until CONNECT_FOUR_ROWS - 1', async () => {
          await makeMoveAndExpectRowPlacement(0, CONNECT_FOUR_ROWS - 1);
          for (let i = 0; i < CONNECT_FOUR_ROWS; i++) {
            await makeMoveAndExpectRowPlacement(1, CONNECT_FOUR_ROWS - 1 - i);
          }
        });
        it('Throws an error if the column is full', async () => {
          await makeMoveAndExpectRowPlacement(0, CONNECT_FOUR_ROWS - 1);
          for (let i = 0; i < CONNECT_FOUR_ROWS; i++) {
            await makeMoveAndExpectRowPlacement(1, CONNECT_FOUR_ROWS - 1 - i);
          }
          const sendInteractableCommandSpy = jest.spyOn(
            mockTownController,
            'sendInteractableCommand',
          );
          sendInteractableCommandSpy.mockClear();
          await expect(() => controller.makeMove(1)).rejects.toThrowError(COLUMN_FULL_MESSAGE);
          expect(sendInteractableCommandSpy).not.toHaveBeenCalled();
        });
      });
    });
  });
});
