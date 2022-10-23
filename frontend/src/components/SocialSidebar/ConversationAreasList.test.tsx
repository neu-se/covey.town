import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';
import { findAllByRole, render, RenderResult, waitFor } from '@testing-library/react';
import { nanoid } from 'nanoid';
import React from 'react';
import { act } from 'react-dom/test-utils';
import ConversationAreaController from '../../classes/ConversationAreaController';
import PlayerController from '../../classes/PlayerController';
import ConversationAreasList from './ConversationAreasList';
import TownController from '../../classes/TownController';
import { LoginController } from '../../contexts/LoginControllerContext';
import { mock, mockClear } from 'jest-mock-extended';
import { BoundingBox, CoveyTownSocket } from '../../types/CoveyTownSocket';
import { getEventListener, mockTownControllerConnection } from '../../TestUtils';
import TownControllerContext from '../../contexts/TownControllerContext';

/**
 * Mocks the socket-io client constructor such that it will always return the same
 * mockSocket instance. Returns that mockSocket instance to the caller of this function,
 * allowing tests to make assertions about the messages emitted to the socket, and also to
 * simulate the receipt of events, @see getEventListener
 */
const mockSocket = mock<CoveyTownSocket>();
jest.mock('socket.io-client', () => {
  const actual = jest.requireActual('socket.io-client');
  return {
    ...actual,
    io: () => mockSocket,
  };
});

function createConversationForTesting(params?: {
  label?: string;
  boundingBox?: BoundingBox;
  occupants?: PlayerController[];
  emptyTopic?: boolean;
}): ConversationAreaController {
  const area = new ConversationAreaController(
    params?.label || nanoid(),
    params?.emptyTopic ? undefined : nanoid(),
  );
  if (params?.occupants) {
    area.occupants = params?.occupants;
  }
  return area;
}

process.env.REACT_APP_TOWNS_SERVICE_URL = 'testing';

describe('ConversationAreasList', () => {
  /**
   * Check that the conversation areas rendered precisely follow the specification for formatting,
   * and that each area has the correct topic and players.
   */
  const expectProperlyRenderedConversationAreas = async (
    renderData: RenderResult,
    areas: ConversationAreaController[],
    players?: PlayerController[][],
  ) => {
    if (areas.length === 0) {
      const expectedText = await renderData.findByText('No active conversation areas');
      expect(expectedText).toBeDefined();
      const areaLabels = renderData.queryAllByRole('heading', { level: 3 });
      expect(areaLabels.length).toBe(0);
    } else {
      const areaLabels = await renderData.findAllByRole('heading', { level: 3 });
      expect(areaLabels.length).toBe(areas.length);
      areas.sort((a1, a2) =>
        a1.id.localeCompare(a2.id, undefined, { numeric: true, sensitivity: 'base' }),
      );
      for (let i = 0; i < areas.length; i += 1) {
        expect(areaLabels[i]).toHaveTextContent(`${areas[i].id}: ${areas[i].topic}`);
        if (players) {
          const { parentElement } = areaLabels[i];
          expect(parentElement).toBeDefined();
          if (parentElement) {
            const playerNodes = await findAllByRole(parentElement, 'listitem');
            const playerNames = playerNodes.map(node => node.textContent);
            const expectedNames = players[i].map(player => player.userName);
            expect(playerNames).toEqual(expectedNames);
            const localExpect = expect; // lint fire :(
            playerNodes.forEach(playerNode => {
              const listContainer = playerNode.parentElement;
              if (listContainer) {
                localExpect(listContainer.nodeName).toBe('UL'); // list items expected to be directly nested in an unordered list
              }
            });
          }
        }
      }
    }
  };

  let consoleErrorSpy: jest.SpyInstance<void, [message?: any, ...optionalParms: any[]]>;
  let testController: TownController;

  beforeAll(() => {
    // Spy on console.error and intercept react key warnings to fail test
    consoleErrorSpy = jest.spyOn(global.console, 'error');
    consoleErrorSpy.mockImplementation((message?, ...optionalParams) => {
      const stringMessage = message as string;
      if (stringMessage.includes('children with the same key,')) {
        throw new Error(stringMessage.replace('%s', optionalParams[0]));
      } else if (stringMessage.includes('warning-keys')) {
        throw new Error(stringMessage.replace('%s', optionalParams[0]));
      }
      // eslint-disable-next-line no-console -- we are wrapping the console with a spy to find react warnings
      console.warn(message, ...optionalParams);
    });
  });
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });
  let playersByArea: PlayerController[][] = [];
  let areas: ConversationAreaController[] = [];
  let renderConversationAreaList: (
    expectedAreas?: ConversationAreaController[],
  ) => Promise<RenderResult>;

  const numAreas = 20;
  const numPlayersPerArea = 5;

  beforeEach(async () => {
    mockClear(mockSocket); //Be sure to clear the past calls, otherwise we'll have test order dependencies

    //Build up some default testing data
    playersByArea = [];
    areas = [];
    let allPlayers: PlayerController[] = [];
    for (let areaID = 0; areaID < numAreas; areaID += 1) {
      const playersInThisArea: PlayerController[] = [];
      for (let playerNum = 0; playerNum < numPlayersPerArea; playerNum += 1) {
        playersInThisArea.push(
          new PlayerController(
            `area${areaID}.${playerNum}playerID:${nanoid()}`,
            `area${areaID}.${playerNum}userName:${nanoid()}`,
            {
              x: 0,
              y: 0,
              interactableID: nanoid(), // should not be checked by conversation area list
              rotation: 'front',
              moving: false,
            },
          ),
        );
      }
      allPlayers = allPlayers.concat(playersInThisArea);
      playersByArea.push(playersInThisArea);
      const area = createConversationForTesting({
        label: `areaLabel${areaID}`,
        occupants: playersInThisArea,
      });
      areas.push(area);
    }
    /**
     * Renders a conversation area list component, providing the testController as the
     * TownController, which will allow us to integration test behaviors that include
     * the TownController and the React hooks + components.
     */
    renderConversationAreaList = async (areasToRender?: ConversationAreaController[]) => {
      testController = new TownController({
        userName: nanoid(),
        townID: nanoid(),
        loginController: mock<LoginController>(),
      });
      if (areasToRender === undefined) {
        areasToRender = areas;
      }
      await mockTownControllerConnection(testController, mockSocket, {
        interactables: areasToRender.map(eachArea => eachArea.toConversationAreaModel()),
        currentPlayers: allPlayers.map(eachPlayer => eachPlayer.toPlayerModel()),
        friendlyName: nanoid(),
        isPubliclyListed: true,
        providerVideoToken: nanoid(),
        sessionToken: nanoid(),
        userID: nanoid(),
      });
      return render(
        <ChakraProvider>
          <React.StrictMode>
            <TownControllerContext.Provider value={testController}>
              <ConversationAreasList />
            </TownControllerContext.Provider>
          </React.StrictMode>
        </ChakraProvider>,
      );
    };
  });
  describe('When there are inactive conversation areas', () => {
    it('Does not display inactive areas', async () => {
      const activeAndInactiveAreas = [
        createConversationForTesting({ emptyTopic: true }),
        areas[0],
        createConversationForTesting({ emptyTopic: true }),
        areas[1],
      ];
      const renderData = await renderConversationAreaList(activeAndInactiveAreas);
      await expectProperlyRenderedConversationAreas(renderData, [areas[0], areas[1]]);
    });
    it('Displays the text "No active conversation areas" when none are active', async () => {
      const inactiveAreas = [
        createConversationForTesting({ emptyTopic: true }),
        createConversationForTesting({ emptyTopic: true }),
      ];
      const renderData = await renderConversationAreaList(inactiveAreas);
      await expectProperlyRenderedConversationAreas(renderData, []);
    });
    it('Shows "No active conversation areas" when there are no conversation areas', async () => {
      const renderData = await renderConversationAreaList([]);
      await expectProperlyRenderedConversationAreas(renderData, []);
    });
  });
  describe('When there are active conversation areas', () => {
    it('Renders the topic and label', async () => {
      const areasProvidedInSortOrder = areas;
      const renderData = await renderConversationAreaList(areasProvidedInSortOrder);
      await expectProperlyRenderedConversationAreas(renderData, areasProvidedInSortOrder);
    });
    it('Sorts the conversation areas by label, ascending', async () => {
      const shuffledAreas = areas.sort(() => 1);
      const renderData = await renderConversationAreaList(shuffledAreas);
      await expectProperlyRenderedConversationAreas(renderData, shuffledAreas);
    });
    it('Displays player names in the order provided', async () => {
      const areasProvidedInSortOrder = areas;
      const renderData = await renderConversationAreaList(areasProvidedInSortOrder);
      await expectProperlyRenderedConversationAreas(
        renderData,
        areasProvidedInSortOrder,
        playersByArea,
      );
    });
    it('Updates the occupants list when they change', async () => {
      const renderData = await renderConversationAreaList(areas);
      await expectProperlyRenderedConversationAreas(renderData, areas, playersByArea);
      const updatedAreas = testController.conversationAreas.map(eachArea => {
        act(() => {
          //Note: because we are triggering a useEffect, we must wrap this line in an act()
          eachArea.occupants = eachArea.occupants.slice(1);
        });
        return eachArea;
      });
      const updatedPlayersByArea = playersByArea.map(eachArea => eachArea.slice(1));
      await expectProperlyRenderedConversationAreas(renderData, updatedAreas, updatedPlayersByArea);
    });
    it('Updates the topic when it changes', async () => {
      const renderData = await renderConversationAreaList(areas);
      await expectProperlyRenderedConversationAreas(renderData, areas, playersByArea);
      const updatedAreas = testController.conversationAreas.map(eachArea => {
        act(() => {
          //Note: because we are triggering a useEffect, we must wrap this line in an act()
          eachArea.topic = nanoid();
        });
        return eachArea;
      });
      await expectProperlyRenderedConversationAreas(renderData, updatedAreas, playersByArea);
    });
  });
  describe('Updating the list of conversation areas', () => {
    it('Updates the list when one is destroyed', async () => {
      const renderData = await renderConversationAreaList(areas);
      await expectProperlyRenderedConversationAreas(renderData, areas, playersByArea);
      const listener = getEventListener(mockSocket, 'interactableUpdate');

      for (const eachArea of areas) {
        act(() => {
          eachArea.topic = undefined;
          listener(eachArea.toConversationAreaModel());
        });
        await waitFor(() =>
          expect(renderData.queryAllByText(eachArea.topic || 'fail', { exact: false })).toEqual([]),
        );
      }
    });
    it('Updates the list when one is created', async () => {
      areas[0].topic = undefined;
      const renderData = await renderConversationAreaList([areas[0]]);
      await expectProperlyRenderedConversationAreas(renderData, [], playersByArea);
      const listener = getEventListener(mockSocket, 'interactableUpdate');
      const newTopic = nanoid();
      act(() => {
        listener({
          id: areas[0].id,
          occupantsByID: areas[0].occupants.map(eachOccupant => eachOccupant.id),
          topic: newTopic,
        });
      });

      await waitFor(() => renderData.getAllByText(newTopic, { exact: false }));
    });
  });
});
