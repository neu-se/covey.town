import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { mock, mockReset } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { act } from 'react-dom/test-utils';
import React from 'react';
import ConnectFourAreaController, {
  ConnectFourCell,
  CONNECT_FOUR_COLS,
  CONNECT_FOUR_ROWS,
} from '../../../../classes/interactable/ConnectFourAreaController';
import PlayerController from '../../../../classes/PlayerController';
import TownController, * as TownControllerHooks from '../../../../classes/TownController';
import TownControllerContext from '../../../../contexts/TownControllerContext';
import { randomLocation } from '../../../../TestUtils';
import {
  ConnectFourColor,
  ConnectFourGameState,
  GameArea,
  GameStatus,
} from '../../../../types/CoveyTownSocket';
import PhaserGameArea from '../GameArea';
import ConnectFourArea from './ConnectFourArea';
import * as ConnectFourBoard from './ConnectFourBoard';

const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const ui = jest.requireActual('@chakra-ui/react');
  const mockUseToast = () => mockToast;
  return {
    ...ui,
    useToast: mockUseToast,
  };
});
const mockGameArea = mock<PhaserGameArea>();
mockGameArea.getData.mockReturnValue('ConnectFour');
jest.spyOn(TownControllerHooks, 'useInteractable').mockReturnValue(mockGameArea);
const useInteractableAreaControllerSpy = jest.spyOn(
  TownControllerHooks,
  'useInteractableAreaController',
);

const boardComponentSpy = jest.spyOn(ConnectFourBoard, 'default');
boardComponentSpy.mockReturnValue(<div data-testid='board' />);
class MockConnectFourAreaController extends ConnectFourAreaController {
  makeMove = jest.fn();

  joinGame = jest.fn();

  startGame = jest.fn();

  mockIsPlayer = false;

  mockIsOurTurn = false;

  mockMoveCount = 0;

  mockBoard: ConnectFourCell[][] = [];

  mockWinner: PlayerController | undefined = undefined;

  mockWhoseTurn: PlayerController | undefined = undefined;

  mockStatus: GameStatus = 'WAITING_TO_START';

  mockRed: PlayerController | undefined = undefined;

  mockYellow: PlayerController | undefined = undefined;

  mockCurrentGame: GameArea<ConnectFourGameState> | undefined = undefined;

  mockGamePiece: ConnectFourColor = 'Red';

  mockIsActive = false;

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

  get red(): PlayerController | undefined {
    return this.mockRed;
  }

  get yellow(): PlayerController | undefined {
    return this.mockYellow;
  }

  get winner(): PlayerController | undefined {
    return this.mockWinner;
  }

  get moveCount(): number {
    return this.mockMoveCount;
  }

  get gamePiece(): ConnectFourColor {
    return this.mockGamePiece;
  }

  get status(): GameStatus {
    return this.mockStatus;
  }

  get whoseTurn(): PlayerController | undefined {
    return this.mockWhoseTurn;
  }

  isEmpty(): boolean {
    return this.mockRed === undefined && this.mockYellow === undefined;
  }

  public isActive(): boolean {
    return this.mockIsActive;
  }

  public mockClear() {
    this.mockBoard = [];
    for (let i = 0; i < CONNECT_FOUR_COLS; i++) {
      this.mockBoard.push([]);
      for (let j = 0; j < CONNECT_FOUR_ROWS; j++) {
        this.mockBoard[i].push(undefined);
      }
    }
    this.makeMove.mockClear();
  }
}
describe('ConnectFourArea', () => {
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

  let ourPlayer: PlayerController;
  const townController = mock<TownController>();
  Object.defineProperty(townController, 'ourPlayer', { get: () => ourPlayer });
  let gameAreaController = new MockConnectFourAreaController();
  let joinGameResolve: () => void;
  let joinGameReject: (err: Error) => void;
  let startGameResolve: () => void;
  let startGameReject: (err: Error) => void;

  function renderConnectFourArea() {
    return render(
      <ChakraProvider>
        <TownControllerContext.Provider value={townController}>
          <ConnectFourArea interactableID={nanoid()} />
        </TownControllerContext.Provider>
      </ChakraProvider>,
    );
  }
  beforeEach(() => {
    ourPlayer = new PlayerController('player x', 'player x', randomLocation());
    mockGameArea.name = nanoid();
    mockReset(townController);
    gameAreaController.mockClear();
    useInteractableAreaControllerSpy.mockReturnValue(gameAreaController);
    mockToast.mockClear();
    gameAreaController.joinGame.mockReset();
    gameAreaController.makeMove.mockReset();

    gameAreaController.joinGame.mockImplementation(
      () =>
        new Promise<void>((resolve, reject) => {
          joinGameResolve = resolve;
          joinGameReject = reject;
        }),
    );
    gameAreaController.startGame.mockImplementation(
      () =>
        new Promise<void>((resolve, reject) => {
          startGameResolve = resolve;
          startGameReject = reject;
        }),
    );
  });
  describe('[T3.1] Game Update Listeners', () => {
    it('Registers exactly one listener for gameUpdated and gameEnd events', () => {
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();

      renderConnectFourArea();
      expect(addListenerSpy).toBeCalledTimes(2);
      expect(addListenerSpy).toHaveBeenCalledWith('gameUpdated', expect.any(Function));
      expect(addListenerSpy).toHaveBeenCalledWith('gameEnd', expect.any(Function));
    });
    it('Does not register a listener on every render', () => {
      const removeListenerSpy = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderConnectFourArea();
      expect(addListenerSpy).toBeCalledTimes(2);
      addListenerSpy.mockClear();

      renderData.rerender(
        <ChakraProvider>
          <TownControllerContext.Provider value={townController}>
            <ConnectFourArea interactableID={nanoid()} />
          </TownControllerContext.Provider>
        </ChakraProvider>,
      );

      expect(addListenerSpy).not.toBeCalled();
      expect(removeListenerSpy).not.toBeCalled();
    });
    it('Removes all listeners on unmount', () => {
      const removeListenerSpy = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderConnectFourArea();
      expect(addListenerSpy).toBeCalledTimes(2);
      const addedListeners = addListenerSpy.mock.calls;
      const addedGameUpdateListener = addedListeners.find(call => call[0] === 'gameUpdated');
      const addedGameEndedListener = addedListeners.find(call => call[0] === 'gameEnd');
      expect(addedGameEndedListener).toBeDefined();
      expect(addedGameUpdateListener).toBeDefined();
      renderData.unmount();
      expect(removeListenerSpy).toBeCalledTimes(2);
      const removedListeners = removeListenerSpy.mock.calls;
      const removedGameUpdateListener = removedListeners.find(call => call[0] === 'gameUpdated');
      const removedGameEndedListener = removedListeners.find(call => call[0] === 'gameEnd');
      expect(removedGameUpdateListener).toEqual(addedGameUpdateListener);
      expect(removedGameEndedListener).toEqual(addedGameEndedListener);
    });
    it('Creates new listeners if the gameAreaController changes', () => {
      const removeListenerSpy = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderConnectFourArea();
      expect(addListenerSpy).toBeCalledTimes(2);

      gameAreaController = new MockConnectFourAreaController();
      const removeListenerSpy2 = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy2 = jest.spyOn(gameAreaController, 'addListener');

      useInteractableAreaControllerSpy.mockReturnValue(gameAreaController);
      renderData.rerender(
        <ChakraProvider>
          <TownControllerContext.Provider value={townController}>
            <ConnectFourArea interactableID={nanoid()} />
          </TownControllerContext.Provider>
        </ChakraProvider>,
      );
      expect(removeListenerSpy).toBeCalledTimes(2);

      expect(addListenerSpy2).toBeCalledTimes(2);
      expect(removeListenerSpy2).not.toBeCalled();
    });
  });
  describe('[T3.2] Join game button', () => {
    it('Is not shown if the game status is IN_PROGRESS', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockRed = new PlayerController(
        'player red',
        'player red',
        randomLocation(),
      );
      gameAreaController.mockYellow = new PlayerController(
        'player y',
        'player y',
        randomLocation(),
      );
      gameAreaController.mockIsPlayer = true;
      renderConnectFourArea();
      expect(screen.queryByText('Join New Game')).not.toBeInTheDocument();
    });
    it('Is not shown if the game status is WAITING_TO_START', () => {
      gameAreaController.mockStatus = 'WAITING_TO_START';
      gameAreaController.mockRed = ourPlayer;
      gameAreaController.mockIsPlayer = true;
      renderConnectFourArea();
      expect(screen.queryByText('Join New Game')).not.toBeInTheDocument();
    });
    it('Is shown if the game status is WAITING_FOR_PLAYERS', () => {
      gameAreaController.mockStatus = 'WAITING_FOR_PLAYERS';
      gameAreaController.mockRed = undefined;
      gameAreaController.mockYellow = new PlayerController(
        'player O',
        'player O',
        randomLocation(),
      );
      gameAreaController.mockIsPlayer = false;
      renderConnectFourArea();
      expect(screen.queryByText('Join New Game')).toBeInTheDocument();
    });
    it('Is shown if the game status is OVER', () => {
      gameAreaController.mockStatus = 'OVER';
      gameAreaController.mockRed = undefined;
      gameAreaController.mockYellow = new PlayerController(
        'player O',
        'player O',
        randomLocation(),
      );
      gameAreaController.mockIsPlayer = false;
      renderConnectFourArea();
      expect(screen.queryByText('Join New Game')).toBeInTheDocument();
    });
    describe('When clicked', () => {
      it('Calls the gameAreaController.joinGame method', () => {
        gameAreaController.mockStatus = 'WAITING_FOR_PLAYERS';
        gameAreaController.mockIsPlayer = false;
        renderConnectFourArea();
        const button = screen.getByText('Join New Game');
        fireEvent.click(button);
        expect(gameAreaController.joinGame).toBeCalled();
      });
      it('Displays a toast with the error message if the joinGame method throws an error', async () => {
        gameAreaController.mockStatus = 'WAITING_FOR_PLAYERS';
        gameAreaController.mockIsPlayer = false;
        renderConnectFourArea();
        const button = screen.getByText('Join New Game');
        fireEvent.click(button);
        expect(gameAreaController.joinGame).toBeCalled();
        const errorMessage = `Testing error message ${nanoid()}`;
        act(() => {
          joinGameReject(new Error(errorMessage));
        });
        await waitFor(() => {
          expect(mockToast).toBeCalledWith(
            expect.objectContaining({
              description: `Error: ${errorMessage}`,
              status: 'error',
            }),
          );
        });
      });
      it('Is disabled and set to loading while the player is joining the game', async () => {
        gameAreaController.mockStatus = 'WAITING_FOR_PLAYERS';
        gameAreaController.mockIsPlayer = false;
        renderConnectFourArea();
        const button = screen.getByText('Join New Game');
        fireEvent.click(button);
        expect(gameAreaController.joinGame).toBeCalled();

        expect(button).toBeDisabled();
        expect(within(button).queryByText('Loading...')).toBeInTheDocument(); //Check that the loading text is displayed
        act(() => {
          joinGameResolve();
        });
        await waitFor(() => expect(button).toBeEnabled());
        expect(within(button).queryByText('Loading...')).not.toBeInTheDocument(); //Check that the loading text is not displayed
      });
      it('Adds the display of the button when a game becomes possible to join', () => {
        gameAreaController.mockStatus = 'WAITING_TO_START';
        gameAreaController.mockIsPlayer = false;
        gameAreaController.mockRed = new PlayerController(
          'player red',
          'player red',
          randomLocation(),
        );
        gameAreaController.mockYellow = new PlayerController(
          'player yellow',
          'player yellow',
          randomLocation(),
        );
        renderConnectFourArea();
        expect(screen.queryByText('Join New Game')).not.toBeInTheDocument();
        act(() => {
          gameAreaController.mockStatus = 'WAITING_FOR_PLAYERS';
          gameAreaController.mockYellow = undefined;
          gameAreaController.emit('gameUpdated');
        });
        expect(screen.queryByText('Join New Game')).toBeInTheDocument();
      });
      it('Removes the button after the player has joined the game', () => {
        gameAreaController.mockStatus = 'WAITING_FOR_PLAYERS';
        gameAreaController.mockIsPlayer = false;
        gameAreaController.mockRed = undefined;
        gameAreaController.mockYellow = new PlayerController(
          'player yellow',
          'player yellow',
          randomLocation(),
        );
        renderConnectFourArea();
        expect(screen.queryByText('Join New Game')).toBeInTheDocument();
        act(() => {
          gameAreaController.mockStatus = 'WAITING_TO_START';
          gameAreaController.mockRed = ourPlayer;
          gameAreaController.emit('gameUpdated');
        });
        expect(screen.queryByText('Join New Game')).not.toBeInTheDocument();
      });
    });
  });
  describe('[T3.3] Start game button', () => {
    it('Is not shown if the game status is IN_PROGRESS', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockRed = ourPlayer;
      gameAreaController.mockYellow = new PlayerController(
        'player y',
        'player y',
        randomLocation(),
      );
      gameAreaController.mockIsPlayer = true;
      renderConnectFourArea();
      expect(screen.queryByText('Start Game')).not.toBeInTheDocument();
    });
    it('Is not shown if the game status is WAITING_FOR_PLAYERS', () => {
      gameAreaController.mockStatus = 'WAITING_FOR_PLAYERS';
      gameAreaController.mockRed = ourPlayer;
      gameAreaController.mockIsPlayer = true;
      renderConnectFourArea();
      expect(screen.queryByText('Start Game')).not.toBeInTheDocument();
    });
    it('Is shown if the game status is WAITING_TO_START', () => {
      gameAreaController.mockStatus = 'WAITING_TO_START';
      gameAreaController.mockRed = ourPlayer;
      gameAreaController.mockYellow = new PlayerController(
        'player y',
        'player y',
        randomLocation(),
      );
      gameAreaController.mockIsPlayer = true;
      renderConnectFourArea();
      expect(screen.queryByText('Start Game')).toBeInTheDocument();
    });
    describe('When clicked', () => {
      it('Calls the gameAreaController.startGame method', () => {
        gameAreaController.mockStatus = 'WAITING_TO_START';
        gameAreaController.mockRed = ourPlayer;
        gameAreaController.mockYellow = new PlayerController(
          'player y',
          'player y',
          randomLocation(),
        );
        gameAreaController.mockIsPlayer = true;
        renderConnectFourArea();
        const button = screen.getByText('Start Game');
        fireEvent.click(button);
        expect(gameAreaController.startGame).toBeCalled();
      });
      it('Displays a toast with the error message if the startGame method throws an error', async () => {
        gameAreaController.mockStatus = 'WAITING_TO_START';
        gameAreaController.mockRed = ourPlayer;
        gameAreaController.mockYellow = new PlayerController(
          'player y',
          'player y',
          randomLocation(),
        );
        gameAreaController.mockIsPlayer = true;
        renderConnectFourArea();
        const button = screen.getByText('Start Game');
        fireEvent.click(button);
        expect(gameAreaController.startGame).toBeCalled();
        const errorMessage = `Testing error message ${nanoid()}`;
        act(() => {
          startGameReject(new Error(errorMessage));
        });
        await waitFor(() => {
          expect(mockToast).toBeCalledWith(
            expect.objectContaining({
              description: `Error: ${errorMessage}`,
              status: 'error',
            }),
          );
        });
      });
      it('Is disabled and set to loading while the player is starting the game', async () => {
        gameAreaController.mockStatus = 'WAITING_TO_START';
        gameAreaController.mockRed = ourPlayer;
        gameAreaController.mockYellow = new PlayerController(
          'player y',
          'player y',
          randomLocation(),
        );
        gameAreaController.mockIsPlayer = true;
        renderConnectFourArea();
        const button = screen.getByText('Start Game');
        fireEvent.click(button);
        expect(gameAreaController.startGame).toBeCalled();

        expect(button).toBeDisabled();
        expect(within(button).queryByText('Loading...')).toBeInTheDocument(); //Check that the loading text is displayed
        act(() => {
          startGameResolve();
        });
        await waitFor(() => expect(button).toBeEnabled());
        expect(within(button).queryByText('Loading...')).not.toBeInTheDocument(); //Check that the loading text is not displayed
      });
      it('Adds the button when a game becomes possible to start', () => {
        gameAreaController.mockStatus = 'WAITING_FOR_PLAYERS';
        gameAreaController.mockRed = ourPlayer;
        gameAreaController.mockIsPlayer = true;
        renderConnectFourArea();
        expect(screen.queryByText('Start Game')).not.toBeInTheDocument();
        act(() => {
          gameAreaController.mockStatus = 'WAITING_TO_START';
          gameAreaController.mockYellow = new PlayerController(
            'player y',
            'player y',
            randomLocation(),
          );
          gameAreaController.emit('gameUpdated');
        });
        expect(screen.queryByText('Start Game')).toBeInTheDocument();
      });
      it('Removes the button once the game is in progress', () => {
        gameAreaController.mockStatus = 'WAITING_TO_START';
        gameAreaController.mockRed = ourPlayer;
        gameAreaController.mockYellow = new PlayerController(
          'player y',
          'player y',
          randomLocation(),
        );
        gameAreaController.mockIsPlayer = true;
        renderConnectFourArea();
        expect(screen.queryByText('Start Game')).toBeInTheDocument();
        act(() => {
          gameAreaController.mockStatus = 'IN_PROGRESS';
          gameAreaController.emit('gameUpdated');
        });
        expect(screen.queryByText('Start Game')).not.toBeInTheDocument();
      });
    });
  });
  describe('[T3.4] Players in game text', () => {
    it('Displays the username of the Red player if there is one', () => {
      gameAreaController.mockRed = new PlayerController(nanoid(), nanoid(), randomLocation());
      gameAreaController.mockStatus = 'WAITING_FOR_PLAYERS';
      gameAreaController.mockIsPlayer = false;
      renderConnectFourArea();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(
        within(listOfPlayers).getByText(`Red: ${gameAreaController.mockRed?.userName}`),
      ).toBeInTheDocument();
    });
    it('Displays the username of the Yellow player if there is one', () => {
      gameAreaController.mockYellow = new PlayerController(nanoid(), nanoid(), randomLocation());
      gameAreaController.mockStatus = 'WAITING_FOR_PLAYERS';
      gameAreaController.mockIsPlayer = false;
      renderConnectFourArea();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(
        within(listOfPlayers).getByText(`Yellow: ${gameAreaController.mockYellow?.userName}`),
      ).toBeInTheDocument();
    });
    it('Displays "Yellow: (No player yet!) if there is no Yellow player', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockYellow = undefined;
      renderConnectFourArea();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(within(listOfPlayers).getByText(`Yellow: (No player yet!)`)).toBeInTheDocument();
    });
    it('Displays "Red: (No player yet!) if there is no Red player', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockRed = undefined;
      renderConnectFourArea();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(within(listOfPlayers).getByText(`Red: (No player yet!)`)).toBeInTheDocument();
    });
    it('Updates the Red player when the game is updated', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockRed = undefined;
      renderConnectFourArea();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(within(listOfPlayers).getByText(`Red: (No player yet!)`)).toBeInTheDocument();
      gameAreaController.mockRed = new PlayerController(nanoid(), nanoid(), randomLocation());
      act(() => {
        gameAreaController.emit('gameUpdated');
      });
      expect(
        within(listOfPlayers).getByText(`Red: ${gameAreaController.mockRed?.userName}`),
      ).toBeInTheDocument();
    });
    it('Updates the Yellow player when the game is updated', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      gameAreaController.mockIsPlayer = false;
      gameAreaController.mockYellow = undefined;
      renderConnectFourArea();
      const listOfPlayers = screen.getByLabelText('list of players in the game');
      expect(within(listOfPlayers).getByText(`Yellow: (No player yet!)`)).toBeInTheDocument();
      gameAreaController.mockYellow = new PlayerController(nanoid(), nanoid(), randomLocation());
      act(() => {
        gameAreaController.emit('gameUpdated');
      });
      expect(
        within(listOfPlayers).getByText(`Yellow: ${gameAreaController.mockYellow?.userName}`),
      ).toBeInTheDocument();
    });
  });
  describe('[T3.5] Game status text', () => {
    it('Displays the correct text when the game is waiting to start', () => {
      gameAreaController.mockStatus = 'WAITING_TO_START';
      renderConnectFourArea();
      expect(
        screen.getByText('Waiting for players to press start', { exact: false }),
      ).toBeInTheDocument();
    });
    it('Displays the correct text when the game is in progress', () => {
      gameAreaController.mockStatus = 'IN_PROGRESS';
      renderConnectFourArea();
      expect(screen.getByText('Game in progress', { exact: false })).toBeInTheDocument();
    });
    it('Displays the correct text when the game is over', () => {
      gameAreaController.mockStatus = 'OVER';
      renderConnectFourArea();
      expect(screen.getByText('Game over', { exact: false })).toBeInTheDocument();
    });
    it('Displays the correct text when the game is waiting for players', () => {
      gameAreaController.mockStatus = 'WAITING_FOR_PLAYERS';
      renderConnectFourArea();
      expect(screen.getByText('Waiting for players to join', { exact: false })).toBeInTheDocument();
    });
    describe('When a game is in progress', () => {
      beforeEach(() => {
        gameAreaController.mockStatus = 'IN_PROGRESS';
        gameAreaController.mockMoveCount = 2;
        gameAreaController.mockRed = ourPlayer;
        gameAreaController.mockYellow = new PlayerController(
          'player y',
          'player y',
          randomLocation(),
        );
        gameAreaController.mockIsPlayer = true;
        gameAreaController.mockIsOurTurn = true;
        gameAreaController.mockWhoseTurn = ourPlayer;
      });
      it('Displays a message "Game in progress, {numMoves} moves in" and indicates whose turn it is when it is our turn', () => {
        renderConnectFourArea();
        expect(
          screen.getByText('Game in progress, 2 moves in, currently your turn', { exact: false }),
        ).toBeInTheDocument();
      });
      it('Displays a message "Game in progress, {numMoves} moves in" and indicates whose turn it is when it is not our turn', () => {
        gameAreaController.mockMoveCount = 1;
        gameAreaController.mockIsOurTurn = false;
        gameAreaController.mockWhoseTurn = gameAreaController.mockYellow;
        renderConnectFourArea();
        expect(
          screen.getByText(
            `Game in progress, 1 moves in, currently ${gameAreaController.yellow?.userName}'s turn`,
            { exact: false },
          ),
        ).toBeInTheDocument();
      });
      it('Updates the move count when the game is updated', () => {
        renderConnectFourArea();
        expect(
          screen.getByText(`Game in progress, 2 moves in`, { exact: false }),
        ).toBeInTheDocument();
        act(() => {
          gameAreaController.mockMoveCount = 3;
          gameAreaController.mockWhoseTurn = gameAreaController.yellow;
          gameAreaController.mockIsOurTurn = false;
          gameAreaController.emit('gameUpdated');
        });
        expect(
          screen.getByText(`Game in progress, 3 moves in`, { exact: false }),
        ).toBeInTheDocument();
      });
      it('Updates the turn when the game is updated', () => {
        renderConnectFourArea();
        expect(screen.getByText(`, currently your turn`, { exact: false })).toBeInTheDocument();
        act(() => {
          gameAreaController.mockMoveCount = 3;
          gameAreaController.mockWhoseTurn = gameAreaController.yellow;
          gameAreaController.mockIsOurTurn = false;
          gameAreaController.emit('gameUpdated');
        });
        expect(
          screen.getByText(`, currently ${gameAreaController.mockYellow?.userName}'s turn`, {
            exact: false,
          }),
        ).toBeInTheDocument();
      });
      it('Updates the game status when the game is updated', () => {
        gameAreaController.mockStatus = 'WAITING_TO_START';
        renderConnectFourArea();
        expect(
          screen.getByText('Waiting for players to press start', { exact: false }),
        ).toBeInTheDocument();
        act(() => {
          gameAreaController.mockStatus = 'IN_PROGRESS';
          gameAreaController.emit('gameUpdated');
        });
        expect(screen.getByText('Game in progress', { exact: false })).toBeInTheDocument();
        act(() => {
          gameAreaController.mockStatus = 'OVER';
          gameAreaController.emit('gameUpdated');
        });
        expect(screen.getByText('Game over', { exact: false })).toBeInTheDocument();
      });
    });
    describe('When the game ends', () => {
      it('Displays a toast with the winner', () => {
        gameAreaController.mockStatus = 'IN_PROGRESS';
        gameAreaController.mockIsPlayer = true;
        gameAreaController.mockRed = ourPlayer;
        gameAreaController.mockYellow = new PlayerController(
          'player y',
          'player y',
          randomLocation(),
        );
        renderConnectFourArea();
        gameAreaController.mockWinner = ourPlayer;
        act(() => {
          gameAreaController.emit('gameEnd');
        });
        expect(mockToast).toBeCalledWith(
          expect.objectContaining({
            description: `You won!`,
          }),
        );
      });
      it('Displays a toast with the loser', () => {
        gameAreaController.mockStatus = 'IN_PROGRESS';
        gameAreaController.mockIsPlayer = true;
        gameAreaController.mockRed = ourPlayer;
        gameAreaController.mockYellow = new PlayerController(
          'player y',
          'player y',
          randomLocation(),
        );
        renderConnectFourArea();
        gameAreaController.mockWinner = gameAreaController.mockYellow;
        act(() => {
          gameAreaController.emit('gameEnd');
        });
        expect(mockToast).toBeCalledWith(
          expect.objectContaining({
            description: `You lost :(`,
          }),
        );
      });
      it('Displays a toast with a tie', () => {
        gameAreaController.mockStatus = 'IN_PROGRESS';
        gameAreaController.mockIsPlayer = true;
        gameAreaController.mockRed = ourPlayer;
        gameAreaController.mockYellow = new PlayerController(
          'player y',
          'player y',
          randomLocation(),
        );
        renderConnectFourArea();
        gameAreaController.mockWinner = undefined;
        act(() => {
          gameAreaController.emit('gameEnd');
        });
        expect(mockToast).toBeCalledWith(
          expect.objectContaining({
            description: 'Game ended in a tie',
          }),
        );
      });
    });
  });
});
