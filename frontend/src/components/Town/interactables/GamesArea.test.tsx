import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import { mock, mockReset } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { act } from 'react-dom/test-utils';
import GameAreaController, {
  GameEventTypes,
} from '../../../classes/interactable/GameAreaController';
import PlayerController from '../../../classes/PlayerController';
import TownController, * as TownControllerHooks from '../../../classes/TownController';
import TownControllerContext from '../../../contexts/TownControllerContext';
import { randomLocation } from '../../../TestUtils';
import { GameArea, GameResult, GameState, InteractableType } from '../../../types/CoveyTownSocket';
import * as ChatChannel from './ChatChannel';
import * as ConnectFourArea from './ConnectFour/ConnectFourArea';
import PhaserGameArea from './GameArea';
import GamesArea, { INVALID_GAME_AREA_TYPE_MESSAGE } from './GamesArea';
import * as Leaderboard from './Leaderboard';
import * as TicTacToeArea from './TicTacToe/TicTacToeArea';
import React from 'react';

const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => {
  const ui = jest.requireActual('@chakra-ui/react');
  const mockUseToast = () => mockToast;
  return {
    ...ui,
    useToast: mockUseToast,
  };
});
const mockGameArea = mock<PhaserGameArea>({
  id: nanoid(),
});
mockGameArea.name = 'TicTacToe';
mockGameArea.getData.mockReturnValue('TicTacToe');
jest.spyOn(TownControllerHooks, 'useInteractable').mockReturnValue(mockGameArea);

const useInteractableAreaControllerSpy = jest.spyOn(
  TownControllerHooks,
  'useInteractableAreaController',
);

const CHAT_CHANNEL_TEST_ID = 'chatWindow';
const chatChannelSpy = jest.spyOn(ChatChannel, 'default');
chatChannelSpy.mockReturnValue(<div data-testid={CHAT_CHANNEL_TEST_ID} />);

const TIC_TAC_TOE_AREA_TEST_ID = 'ticTacToeArea';
const ticTacToeAreaSpy = jest.spyOn(TicTacToeArea, 'default');
ticTacToeAreaSpy.mockReturnValue(<div data-testid={TIC_TAC_TOE_AREA_TEST_ID} />);

const CONNECT_FOUR_AREA_TEST_ID = 'connectFourArea';
const connectFourAreaSpy = jest.spyOn(ConnectFourArea, 'default');
connectFourAreaSpy.mockReturnValue(<div data-testid={CONNECT_FOUR_AREA_TEST_ID} />);

const leaderboardComponentSpy = jest.spyOn(Leaderboard, 'default');
leaderboardComponentSpy.mockReturnValue(<div data-testid='leaderboard' />);

class MockGameAreaController extends GameAreaController<GameState, GameEventTypes> {
  private _type: InteractableType = 'TicTacToeArea';

  private _mockID: string;

  public constructor() {
    const id = nanoid();
    super(id, mock<GameArea<GameState>>(), mock<TownController>());
    this._mockID = id;
  }

  public get id() {
    return this._mockID;
  }

  public set id(newID: string) {
    this._mockID = newID;
  }

  public set type(type: InteractableType) {
    this._type = type;
  }

  toInteractableAreaModel(): GameArea<GameState> {
    if (!this._type) throw new Error('Type not set');
    const ret = mock<GameArea<GameState>>();
    ret.type = this._type;
    return ret;
  }

  mockHistory: GameResult[] = [];

  mockObservers: PlayerController[] = [];

  get observers(): PlayerController[] {
    return this.mockObservers;
  }

  get history(): GameResult[] {
    return this.mockHistory;
  }

  public isActive(): boolean {
    return true;
  }
}
describe('GamesArea', () => {
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
  let ourPlayer: PlayerController;
  const townController = mock<TownController>();
  Object.defineProperty(townController, 'ourPlayer', { get: () => ourPlayer });
  let gameAreaController = new MockGameAreaController();
  function setGameAreaControllerID(id: string) {
    gameAreaController.id = id;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mockGameArea.id = id;
  }

  beforeEach(() => {
    ourPlayer = new PlayerController('player x', 'player x', randomLocation());
    mockReset(townController);
    useInteractableAreaControllerSpy.mockReturnValue(gameAreaController);
    setGameAreaControllerID(nanoid());
    leaderboardComponentSpy.mockClear();
    mockToast.mockClear();
    chatChannelSpy.mockClear();
  });
  function renderGamesArea() {
    return render(
      <ChakraProvider>
        <TownControllerContext.Provider value={townController}>
          <GamesArea />
        </TownControllerContext.Provider>
      </ChakraProvider>,
    );
  }

  describe('[T2.4] Rendering the correct game', () => {
    test('If the interactableID is for a ConnectFour game, the ConnectFourGameArea should be rendered', () => {
      gameAreaController.type = 'ConnectFourArea';
      renderGamesArea();
      expect(screen.getByTestId(CONNECT_FOUR_AREA_TEST_ID)).toBeInTheDocument();
    });
    test('If the interactableID is for a TicTacToe game, the TicTacToeGameArea should be rendered', () => {
      gameAreaController.type = 'TicTacToeArea';
      renderGamesArea();
      expect(screen.getByTestId(TIC_TAC_TOE_AREA_TEST_ID)).toBeInTheDocument();
    });
    test('If the interactableID is NOT for a ConnectFour or TicTacToe game, an error should be displayed', () => {
      gameAreaController.type = 'ViewingArea'; //Not a game!
      renderGamesArea();

      expect(screen.queryByTestId(CONNECT_FOUR_AREA_TEST_ID)).toBeNull();
      expect(screen.queryByTestId(TIC_TAC_TOE_AREA_TEST_ID)).toBeNull();

      expect(screen.getByText(INVALID_GAME_AREA_TYPE_MESSAGE)).toBeInTheDocument();
    });
  });
  describe('[T2.2] Leaderboard', () => {
    it('Renders the leaderboard with the history when the component is mounted', () => {
      gameAreaController.mockHistory = [
        {
          gameID: nanoid(),
          scores: {
            [nanoid()]: 1,
            [nanoid()]: 0,
          },
        },
      ];
      renderGamesArea();
      expect(leaderboardComponentSpy).toHaveBeenCalledWith(
        {
          results: gameAreaController.mockHistory,
        },
        {},
      );
    });
    it('Renders the leaderboard with the history when the game is updated', () => {
      gameAreaController.mockHistory = [
        {
          gameID: nanoid(),
          scores: {
            [nanoid()]: 1,
            [nanoid()]: 0,
          },
        },
      ];
      renderGamesArea();
      expect(leaderboardComponentSpy).toHaveBeenCalledWith(
        {
          results: gameAreaController.mockHistory,
        },
        {},
      );

      gameAreaController.mockHistory = [
        {
          gameID: nanoid(),
          scores: {
            [nanoid()]: 1,
            [nanoid()]: 1,
          },
        },
      ];
      act(() => {
        gameAreaController.emit('gameUpdated');
      });
      expect(leaderboardComponentSpy).toHaveBeenCalledWith(
        {
          results: gameAreaController.mockHistory,
        },
        {},
      );
    });
  });
  describe('[T2.3] List of observers', () => {
    beforeEach(() => {
      gameAreaController.mockObservers = [
        new PlayerController('player 1', 'player 1', randomLocation()),
        new PlayerController('player 2', 'player 2', randomLocation()),
        new PlayerController('player 3', 'player 3', randomLocation()),
      ];
    });
    it('Displays the correct observers when the component is mounted', () => {
      renderGamesArea();
      const observerList = screen.getByLabelText('list of observers in the game');
      const observerItems = observerList.querySelectorAll('li');
      expect(observerItems).toHaveLength(gameAreaController.mockObservers.length);
      for (let i = 0; i < observerItems.length; i++) {
        expect(observerItems[i]).toHaveTextContent(gameAreaController.mockObservers[i].userName);
      }
    });
    it('Displays the correct observers when the game is updated', () => {
      renderGamesArea();
      act(() => {
        gameAreaController.mockObservers = [
          new PlayerController('player 1', 'player 1', randomLocation()),
          new PlayerController('player 2', 'player 2', randomLocation()),
          new PlayerController('player 3', 'player 3', randomLocation()),
          new PlayerController('player 4', 'player 4', randomLocation()),
        ];
        gameAreaController.emit('gameUpdated');
      });
      const observerList = screen.getByLabelText('list of observers in the game');
      const observerItems = observerList.querySelectorAll('li');
      expect(observerItems).toHaveLength(gameAreaController.mockObservers.length);
      for (let i = 0; i < observerItems.length; i++) {
        expect(observerItems[i]).toHaveTextContent(gameAreaController.mockObservers[i].userName);
      }
    });
  });
  describe('[T2.1] Listeners', () => {
    it('Registers exactly one listeners when mounted: for gameUpdated', () => {
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();

      renderGamesArea();
      expect(addListenerSpy).toBeCalledTimes(1);
      expect(addListenerSpy).toHaveBeenCalledWith('gameUpdated', expect.any(Function));
    });
    it('Does not register listeners on every render', () => {
      const removeListenerSpy = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderGamesArea();
      expect(addListenerSpy).toBeCalledTimes(1);
      addListenerSpy.mockClear();

      renderData.rerender(
        <ChakraProvider>
          <TownControllerContext.Provider value={townController}>
            <GamesArea />
          </TownControllerContext.Provider>
        </ChakraProvider>,
      );

      expect(addListenerSpy).not.toBeCalled();
      expect(removeListenerSpy).not.toBeCalled();
    });
    it('Removes the listeners when the component is unmounted', () => {
      const removeListenerSpy = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderGamesArea();
      expect(addListenerSpy).toBeCalledTimes(1);
      const addedListeners = addListenerSpy.mock.calls;
      const addedGameUpdateListener = addedListeners.find(call => call[0] === 'gameUpdated');
      expect(addedGameUpdateListener).toBeDefined();
      renderData.unmount();
      expect(removeListenerSpy).toBeCalledTimes(1);
      const removedListeners = removeListenerSpy.mock.calls;
      const removedGameUpdateListener = removedListeners.find(call => call[0] === 'gameUpdated');
      expect(removedGameUpdateListener).toEqual(addedGameUpdateListener);
    });
    it('Creates new listeners if the gameAreaController changes', () => {
      const removeListenerSpy = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy = jest.spyOn(gameAreaController, 'addListener');
      addListenerSpy.mockClear();
      removeListenerSpy.mockClear();
      const renderData = renderGamesArea();
      expect(addListenerSpy).toBeCalledTimes(1);

      gameAreaController = new MockGameAreaController();
      const removeListenerSpy2 = jest.spyOn(gameAreaController, 'removeListener');
      const addListenerSpy2 = jest.spyOn(gameAreaController, 'addListener');

      useInteractableAreaControllerSpy.mockReturnValue(gameAreaController);
      renderData.rerender(
        <ChakraProvider>
          <TownControllerContext.Provider value={townController}>
            <GamesArea />
          </TownControllerContext.Provider>
        </ChakraProvider>,
      );
      expect(removeListenerSpy).toBeCalledTimes(1);

      expect(addListenerSpy2).toBeCalledTimes(1);
      expect(removeListenerSpy2).not.toBeCalled();
    });
  });
  describe('[T2.5] Chat', () => {
    it('Renders a ChatChannel with the interactableID', () => {
      renderGamesArea();
      expect(chatChannelSpy).toHaveBeenCalledWith(
        {
          interactableID: gameAreaController.id,
        },
        {},
      );
    });
    it('Re-renders the ChatChannel when the interactableID changes', () => {
      const renderData = renderGamesArea();
      expect(chatChannelSpy).toHaveBeenCalledWith(
        {
          interactableID: gameAreaController.id,
        },
        {},
      );
      setGameAreaControllerID(nanoid());
      renderData.rerender(
        <ChakraProvider>
          <TownControllerContext.Provider value={townController}>
            <GamesArea />
          </TownControllerContext.Provider>
        </ChakraProvider>,
      );
      expect(chatChannelSpy).toHaveBeenCalledWith(
        {
          interactableID: gameAreaController.id,
        },
        {},
      );
    });
  });
});
