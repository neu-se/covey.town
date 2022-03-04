import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';
import { findAllByRole, render, RenderResult, waitFor } from '@testing-library/react';
import { nanoid } from 'nanoid';
import React from 'react';
import { act } from 'react-dom/test-utils';
import BoundingBox from '../../classes/BoundingBox';
import ConversationArea, { ConversationAreaListener } from '../../classes/ConversationArea';
import Player from '../../classes/Player';
import * as useConversationAreas from '../../hooks/useConversationAreas';
import * as usePlayersInTown from '../../hooks/usePlayersInTown';
import ConversationAreasList from './ConversationAreasList';
import * as PlayerName from './PlayerName';

function createConversationForTesting(params?: {
  label?: string;
  boundingBox?: BoundingBox;
  occupantIDs?: string[];
  emptyTopic?: boolean;
}): ConversationArea {
  const area = new ConversationArea(
    params?.label || nanoid(),
    params?.boundingBox || new BoundingBox(400, 400, 100, 100),
    params?.emptyTopic ? '' : nanoid(),
  );
  if (params?.occupantIDs) {
    area.occupants = params?.occupantIDs;
  }
  return area;
}

describe('ConversationAreasList', () => {
  const renderConversationAreaList = () =>
    render(
      <ChakraProvider>
        <React.StrictMode>
          <ConversationAreasList />
        </React.StrictMode>
      </ChakraProvider>,
    );

  const expectProperlyRenderedConversationAreas = async (
    renderData: RenderResult,
    areas: ConversationArea[],
    players?: Player[][],
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
        a1.label.localeCompare(a2.label, undefined, { numeric: true, sensitivity: 'base' }),
      );
      for (let i = 0; i < areas.length; i += 1) {
        expect(areaLabels[i]).toHaveTextContent(`${areas[i].label}: ${areas[i].topic}`);
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

  let useConversationAreasSpy: jest.SpyInstance<ConversationArea[], []>;
  let consoleErrorSpy: jest.SpyInstance<void, [message?: any, ...optionalParms: any[]]>;
  let usePlayersInTownSpy: jest.SpyInstance<Player[], []>;

  let addListenerSpys: jest.SpyInstance<void, [listener: ConversationAreaListener]>[] = [];
  let removeListenerSpys: jest.SpyInstance<void, [listener: ConversationAreaListener]>[] = [];
  beforeAll(() => {
    useConversationAreasSpy = jest.spyOn(useConversationAreas, 'default');

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

    usePlayersInTownSpy = jest.spyOn(usePlayersInTown, 'default');
  });
  afterAll(() => {
    useConversationAreasSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    usePlayersInTownSpy.mockRestore();
  });
  let playersByArea: Player[][] = [];
  let areas: ConversationArea[] = [];

  const NUM_AREAS = 20;
  const NUM_PLAYERS_PER_AREA = 5;

  beforeEach(() => {
    playersByArea = [];
    areas = [];
    let allPlayers: Player[] = [];
    for (let areaID = 0; areaID < NUM_AREAS; areaID += 1) {
      const playersInThisArea: Player[] = [];
      for (let playerNum = 0; playerNum < NUM_PLAYERS_PER_AREA; playerNum += 1) {
        playersInThisArea.push(
          new Player(
            `area${areaID}.${playerNum}playerID:${nanoid()}`,
            `area${areaID}.${playerNum}userName:${nanoid()}`,
            {
              x: 0,
              y: 0,
              conversationLabel: nanoid(), // should not be checked by conversation area list
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
        occupantIDs: playersInThisArea.map(player => player.id),
      });
      areas.push(area);
    }
    usePlayersInTownSpy.mockReturnValue(allPlayers);
    addListenerSpys = areas.map(area => jest.spyOn(area, 'addListener'));
    removeListenerSpys = areas.map(area => jest.spyOn(area, 'removeListener'));
  });
  describe('[T1] Without checking the player IDs', () => {
    it('Renders the topic and label for a single conversation area', async () => {
      const singleArea = [areas[0]];
      useConversationAreasSpy.mockReturnValue(singleArea);
      const renderData = renderConversationAreaList();
      await expectProperlyRenderedConversationAreas(renderData, singleArea);
    });
    it('Renders the topic and label for multiple conversation areas', async () => {
      const areasProvidedInSortOrder = areas;
      useConversationAreasSpy.mockReturnValue(areasProvidedInSortOrder);
      const renderData = renderConversationAreaList();
      await expectProperlyRenderedConversationAreas(renderData, areasProvidedInSortOrder);
    });
    it('Renders the topic and label for multiple conversation areas, and sorts them by label ascending', async () => {
      const shuffledAreas = areas.sort(() => 1);
      useConversationAreasSpy.mockReturnValue(shuffledAreas);
      const renderData = renderConversationAreaList();
      await expectProperlyRenderedConversationAreas(renderData, shuffledAreas);
    });
  });
  it('[T2] When checking usernames, it sorts conversation areas by topic and lists player usernames in provided order', async () => {
    const areasProvidedInSortOrder = areas;
    useConversationAreasSpy.mockReturnValue(areasProvidedInSortOrder);
    const renderData = renderConversationAreaList();
    await expectProperlyRenderedConversationAreas(
      renderData,
      areasProvidedInSortOrder,
      playersByArea,
    );
  });
  describe('[T3] When there are inactive conversation areas', () => {
    it('Does not display inactive areas', async () => {
      const activeAndInactiveAreas = [
        createConversationForTesting({ emptyTopic: true }),
        areas[0],
        createConversationForTesting({ emptyTopic: true }),
        areas[1],
      ];
      useConversationAreasSpy.mockReturnValue(activeAndInactiveAreas);
      const renderData = renderConversationAreaList();
      await expectProperlyRenderedConversationAreas(renderData, [areas[0], areas[1]]);
    });
    it('Displays the text "No active conversation areas" when none are active', async () => {
      const inactiveAreas = [
        createConversationForTesting({ emptyTopic: true }),
        createConversationForTesting({ emptyTopic: true }),
      ];
      useConversationAreasSpy.mockReturnValue(inactiveAreas);
      const renderData = renderConversationAreaList();
      await expectProperlyRenderedConversationAreas(renderData, []);
    });
    it('Shows "No active conversation areas" when there are no conversation areas', async () => {
      useConversationAreasSpy.mockReturnValue([]);
      const renderData = renderConversationAreaList();
      await expectProperlyRenderedConversationAreas(renderData, []);
    });
  });
  describe('[T4] Registration of listener with useEffect', () => {
    let useEffectSpy: jest.SpyInstance<
      void,
      [effect: React.EffectCallback, deps?: React.DependencyList | undefined]
    >;

    beforeAll(() => {
      useEffectSpy = jest.spyOn(React, 'useEffect').mockImplementation(() => {});
    });
    beforeEach(() => {
      useConversationAreasSpy.mockReturnValue(areas);
      useEffectSpy.mockClear();
    });
    it('Component does not call addListener, but useEffect callback does', () => {
      renderConversationAreaList();
      addListenerSpys.forEach(listener => expect(listener).not.toBeCalled());
      expect(useEffectSpy).toHaveBeenCalled();
      useEffectSpy.mock.calls.forEach(mockCallArgs => mockCallArgs[0]()); // call each UseEffect's callbacks
      addListenerSpys.forEach(listener => expect(listener).toHaveBeenCalled());
    });
    it('Creates a listener and adds it to the conversation area when mounted', async () => {
      const renderData = renderConversationAreaList();
      await expectProperlyRenderedConversationAreas(renderData, areas, playersByArea);
      useEffectSpy.mock.calls.forEach(mockCallArgs => mockCallArgs[0]()); // call each UseEffect's callbacks
      addListenerSpys.forEach(listener => expect(listener).toHaveBeenCalled());
    });
    it('Calls removeListener from the cleanup callback', () => {
      renderConversationAreaList();
      expect(useEffectSpy).toHaveBeenCalled(); // each area gets rendered once, one call to use effect
      useEffectSpy.mock.calls.forEach(mockCallArgs => {
        const cleanupHook = mockCallArgs[0]();
        if (cleanupHook) {
          cleanupHook();
        }
      }); // call each UseEffect's cleanup
      removeListenerSpys.forEach(listener => expect(listener).toHaveBeenCalled());
    });
    afterAll(() => {
      useEffectSpy.mockRestore();
    });
  });
  describe('[T5] Updating occupants from the onOccupantsChange listener', () => {
    beforeEach(() => {
      useConversationAreasSpy.mockReturnValue(areas);
    });

    it('Adds players when added to the occupants array', async () => {
      const renderData = renderConversationAreaList();
      await waitFor(() => addListenerSpys.forEach(listener => expect(listener).toBeCalledTimes(1)));
      const updatedAreas: ConversationArea[] = [];
      const updatedPlayersByArea: Player[][] = [];
      const localAreas = areas;
      for (let i = 0; i < localAreas.length; i += 1) {
        const updatedArea = localAreas[i].copy();

        // Trigger the listener indirectly, through the setter on ConversationArea
        act(() => {
          updatedArea.occupants = localAreas[i].occupants.concat([
            localAreas[localAreas.length - i - 1].occupants[0],
          ]);
        });

        updatedAreas.push(updatedArea);
        updatedPlayersByArea.push(
          playersByArea[i].concat([playersByArea[localAreas.length - i - 1][0]]),
        );
      }
      await expectProperlyRenderedConversationAreas(renderData, updatedAreas, updatedPlayersByArea);
      addListenerSpys.forEach(listener => expect(listener).toBeCalledTimes(1)); // make sure new listeners not added
      removeListenerSpys.forEach(listener => expect(listener).not.toHaveBeenCalled()); // make sure remove listener never called
    });
    it('Removes players when removed from the occupants array', async () => {
      const renderData = renderConversationAreaList();
      await waitFor(() => addListenerSpys.forEach(listener => expect(listener).toBeCalledTimes(1)));
      const updatedAreas: ConversationArea[] = [];
      const updatedPlayersByArea: Player[][] = [];
      const localAreas = areas;

      for (let i = 0; i < localAreas.length; i += 1) {
        const updatedArea = localAreas[i].copy();

        // Trigger the listener indirectly, through the setter on ConversationArea
        act(() => {
          updatedArea.occupants = localAreas[i].occupants.slice(2, -1);
        });

        updatedAreas.push(updatedArea);
        updatedPlayersByArea.push(playersByArea[i].slice(2, -1));
      }
      await expectProperlyRenderedConversationAreas(renderData, updatedAreas, updatedPlayersByArea);
      addListenerSpys.forEach(listener => expect(listener).toBeCalledTimes(1)); // make sure new listeners not added
      removeListenerSpys.forEach(listener => expect(listener).not.toHaveBeenCalled()); // make sure remove listener never called
    });
    it('Reorders players when shuffled in the occupants array', async () => {
      const renderData = renderConversationAreaList();
      await waitFor(() => addListenerSpys.forEach(listener => expect(listener).toBeCalledTimes(1)));
      const updatedAreas: ConversationArea[] = [];
      const updatedPlayersByArea: Player[][] = [];
      const localAreas = areas;
      for (let i = 0; i < localAreas.length; i += 1) {
        const updatedArea = localAreas[i].copy();

        // Trigger the listener indirectly, through the setter on ConversationArea
        act(() => {
          updatedArea.occupants = localAreas[i].occupants.concat([]).reverse();
        });

        updatedAreas.push(updatedArea);
        updatedPlayersByArea.push(playersByArea[i].concat([]).reverse());
      }
      await expectProperlyRenderedConversationAreas(renderData, updatedAreas, updatedPlayersByArea);
      addListenerSpys.forEach(listener => expect(listener).toBeCalledTimes(1)); // make sure new listeners not added
      removeListenerSpys.forEach(listener => expect(listener).not.toHaveBeenCalled()); // make sure remove listener never called
    });
    it('Removes its listener from the ConversationArea when unmounting', async () => {
      const renderData = renderConversationAreaList();
      // Mount, wait for addListener to be called
      await waitFor(() => addListenerSpys.forEach(listener => expect(listener).toBeCalledTimes(1)));
      // Unmount, wait for removeListener to be called
      renderData.unmount();
      await waitFor(() =>
        removeListenerSpys.forEach(listener => expect(listener).toBeCalledTimes(1)),
      );
      // Lastly, make sure that removeListener was called with the same listener as addListener was called with
      for (let i = 0; i < addListenerSpys.length; i += 1) {
        const listenerAdded = addListenerSpys[i].mock.calls[0][0];
        const listenerRemoved = removeListenerSpys[i].mock.calls[0][0];
        expect(listenerRemoved).toBe(listenerAdded);
      }
    });
    it("Renders the players' names in a PlayerName component", async () => {
      const mockPlayerName = jest.spyOn(PlayerName, 'default');
      const expectedPlayers = playersByArea.reduce((prev, cur) => prev + cur.length, 0);
      try {
        renderConversationAreaList();
        await waitFor(() => {
          expect(mockPlayerName).toBeCalledTimes(expectedPlayers);
        });
      } finally {
        mockPlayerName.mockRestore();
      }
    });
  });
});
