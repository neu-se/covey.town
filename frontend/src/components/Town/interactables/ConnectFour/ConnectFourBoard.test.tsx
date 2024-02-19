import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import ConnectFourAreaController, {
  ConnectFourCell,
  CONNECT_FOUR_COLS,
  CONNECT_FOUR_ROWS,
} from '../../../../classes/interactable/ConnectFourAreaController';
import PlayerController from '../../../../classes/PlayerController';
import TownController from '../../../../classes/TownController';
import {
  ConnectFourColIndex,
  ConnectFourColor,
  ConnectFourGameState,
  GameArea,
  GameStatus,
} from '../../../../types/CoveyTownSocket';
import ConnectFourBoard from './ConnectFourBoard';
import { act } from 'react-dom/test-utils';

const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const ui = jest.requireActual('@chakra-ui/react');
  const mockUseToast = () => mockToast;
  return {
    ...ui,
    useToast: mockUseToast,
  };
});

class MockConnectFourAreaController extends ConnectFourAreaController {
  mockBoard: ConnectFourCell[][] = [];

  mockIsPlayer = false;

  mockIsOurTurn = false;

  makeMove = jest.fn();

  public constructor() {
    super(nanoid(), mock<GameArea<ConnectFourGameState>>(), mock<TownController>());
    this.mockClear();
  }

  /*
    For ease of testing, we will mock the board property
    to return a copy of the mockBoard property, so that
    we can change the mockBoard property and then check
    that the board property is updated correctly.
    */
  get board() {
    const copy = this.mockBoard.concat([]);
    for (let i = 0; i < copy.length; i++) {
      copy[i] = copy[i].concat([]);
    }
    return copy;
  }

  get isOurTurn() {
    return this.mockIsOurTurn;
  }

  get isPlayer() {
    return this.mockIsPlayer;
  }

  mockClear() {
    this.mockBoard = [];
    for (let i = 0; i < CONNECT_FOUR_COLS; i++) {
      this.mockBoard.push([]);
      for (let j = 0; j < CONNECT_FOUR_ROWS; j++) {
        this.mockBoard[i].push(undefined);
      }
    }
    this.makeMove.mockClear();
  }

  //No other method shoudl be callable
  get red(): PlayerController | undefined {
    throw new Error('Method should not be called within this component');
  }

  get yellow(): PlayerController | undefined {
    throw new Error('Method should not be called within this component');
  }

  get winner(): PlayerController | undefined {
    throw new Error('Method should not be called within this component');
  }

  get moveCount(): number {
    throw new Error('Method should not be called within this component');
  }

  get gamePiece(): ConnectFourColor {
    throw new Error('Method should not be called within this component');
  }

  get status(): GameStatus {
    throw new Error('Method should not be called within this component');
  }

  get whoseTurn(): PlayerController | undefined {
    throw new Error('Method should not be called within this component');
  }

  isEmpty(): boolean {
    throw new Error('Method should not be called within this component');
  }

  public isActive(): boolean {
    throw new Error('Method should not be called within this component');
  }

  public startGame(): Promise<void> {
    throw new Error('Method should not be called within this component');
  }
}
describe('ConnectFourBoard', () => {
  // Spy on console.error and intercept react key warnings to fail test
  let consoleErrorSpy: jest.SpyInstance<void, [message?: any, ...optionalParms: any[]]>;
  beforeAll(() => {
    // Spy on console.error and intercept react key warnings to fail test
    consoleErrorSpy = jest.spyOn(global.console, 'error');
    consoleErrorSpy.mockImplementation((message?, ...optionalParams) => {
      const stringMessage = message as string;
      if (stringMessage.includes && stringMessage.includes('children with the same key,')) {
        throw new Error(stringMessage.replace('%s', optionalParams[0]));
      } else if (stringMessage.includes && stringMessage.includes('warning-keys')) {
        throw new Error(stringMessage.replace('%s', optionalParams[0]));
      }
      // eslint-disable-next-line no-console -- we are wrapping the console with a spy to find react warnings
      console.warn(message, ...optionalParams);
    });
  });
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });
  const gameAreaController = new MockConnectFourAreaController();
  beforeEach(() => {
    gameAreaController.mockClear();
    mockToast.mockClear();
  });
  async function checkBoard({
    clickable,
    checkMakeMove,
    checkToast,
  }: {
    clickable?: boolean;
    checkMakeMove?: boolean;
    checkToast?: boolean;
  }) {
    gameAreaController.makeMove.mockClear();
    const cells = screen.getAllByRole('button');
    // Check that the correct number of cells are rendered
    expect(cells.length).toBe(CONNECT_FOUR_COLS * CONNECT_FOUR_ROWS);
    //Each cell should have the correct aria-label
    for (let i = 0; i < cells.length; i++) {
      const cell =
        gameAreaController.board[Math.floor(i / CONNECT_FOUR_ROWS)][i % CONNECT_FOUR_ROWS];
      expect(cells[i]).toHaveAttribute(
        'aria-label',
        `Cell ${Math.floor(i / CONNECT_FOUR_ROWS)},${i % CONNECT_FOUR_ROWS} (${cell || 'Empty'})`,
      );
    }
    //Each cell should have the correct background color
    for (let i = 0; i < cells.length; i++) {
      const cell =
        gameAreaController.board[Math.floor(i / CONNECT_FOUR_ROWS)][i % CONNECT_FOUR_ROWS];
      expect(cells[i]).toHaveStyle(`background-color: ${cell || 'ButtonFace'}`);
    }
    if (clickable) {
      //Each cell should be clickable
      for (let i = 0; i < cells.length; i++) {
        expect(cells[i]).toBeEnabled();
        gameAreaController.makeMove.mockReset();
        mockToast.mockClear();
        fireEvent.click(cells[i]);
        if (checkMakeMove) {
          expect(gameAreaController.makeMove).toHaveBeenCalledWith(
            (i % CONNECT_FOUR_ROWS) as ConnectFourColIndex,
          );
        }
        if (checkToast) {
          gameAreaController.makeMove.mockClear();
          expect(mockToast).not.toBeCalled();
          mockToast.mockClear();
          const expectedMessage = `Invalid Move ${nanoid()}}`;
          gameAreaController.makeMove.mockRejectedValue(new Error(expectedMessage));
          fireEvent.click(cells[i]);
          await waitFor(() => {
            expect(mockToast).toBeCalledWith(
              expect.objectContaining({
                status: 'error',
                description: `Error: ${expectedMessage}`,
              }),
            );
          });
        }
      }
    } else {
      //Each cell should be disabled
      for (let i = 0; i < cells.length; i++) {
        expect(cells[i]).toBeDisabled();
        //AND clicking shoudl do nothing
        fireEvent.click(cells[i]);
        expect(gameAreaController.makeMove).not.toHaveBeenCalled();
      }
    }
  }
  describe('[T4.1] When observing a game', () => {
    beforeEach(() => {
      gameAreaController.mockIsPlayer = false;
    });
    it('should render a board with the correct number of squares with each cell disabled', async () => {
      render(<ConnectFourBoard gameAreaController={gameAreaController} />);
      await checkBoard({});
    });
    it('updates the board in response to boardChanged events', async () => {
      render(<ConnectFourBoard gameAreaController={gameAreaController} />);
      await checkBoard({});
      //Change the board
      gameAreaController.mockBoard[0][0] = 'Red';
      gameAreaController.mockBoard[0][1] = 'Red';
      act(() => {
        gameAreaController.emit('boardChanged', gameAreaController.mockBoard);
      });
      await checkBoard({});
      gameAreaController.mockClear();
      gameAreaController.mockBoard[0][0] = 'Red';
      gameAreaController.mockBoard[0][1] = 'Red';
      gameAreaController.mockBoard[1][2] = 'Yellow';
      gameAreaController.mockBoard[2][3] = 'Yellow';
      act(() => {
        gameAreaController.emit('boardChanged', gameAreaController.mockBoard);
      });
      await checkBoard({});
    });
  });
  describe('[T4.2] When playing a game', () => {
    beforeEach(() => {
      gameAreaController.mockIsOurTurn = true;
      gameAreaController.mockIsPlayer = true;
    });
    it('enables squares when it is our turn and disables when not', async () => {
      render(<ConnectFourBoard gameAreaController={gameAreaController} />);
      await checkBoard({ clickable: true });
      gameAreaController.mockIsOurTurn = false;
      act(() => {
        gameAreaController.emit('turnChanged', false);
      });
      await checkBoard({ clickable: false });
    });
    it('makes a move when a square is clicked', async () => {
      render(<ConnectFourBoard gameAreaController={gameAreaController} />);
      await checkBoard({ clickable: true, checkMakeMove: true });
    });
    it('updates the board in response to boardChanged events', async () => {
      render(<ConnectFourBoard gameAreaController={gameAreaController} />);
      await checkBoard({ clickable: true });
      //Change the board
      gameAreaController.mockBoard[0][0] = 'Red';
      gameAreaController.mockBoard[0][1] = 'Red';
      act(() => {
        gameAreaController.emit('boardChanged', gameAreaController.mockBoard);
      });
      await checkBoard({ clickable: true });
      gameAreaController.mockClear();
      gameAreaController.mockBoard[0][0] = 'Red';
      gameAreaController.mockBoard[0][1] = 'Red';
      gameAreaController.mockBoard[1][2] = 'Yellow';
      gameAreaController.mockBoard[2][3] = 'Yellow';
      act(() => {
        gameAreaController.emit('boardChanged', gameAreaController.mockBoard);
      });
      await checkBoard({ clickable: true });
    });
    it('displays an error toast when an invalid move is made', async () => {
      render(<ConnectFourBoard gameAreaController={gameAreaController} />);
      await checkBoard({ clickable: true, checkMakeMove: true, checkToast: true });
    });
  });
});
