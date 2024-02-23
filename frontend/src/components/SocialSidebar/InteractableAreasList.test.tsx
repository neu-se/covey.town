import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import { findAllByRole, render, RenderResult } from '@testing-library/react';
import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import ConversationAreaController from '../../classes/interactable/ConversationAreaController';
import * as InteractableAreaHooks from '../../classes/interactable/InteractableAreaController';
import {
  GAME_AREA_TYPE,
  GenericInteractableAreaController,
  VIEWING_AREA_TYPE,
} from '../../classes/interactable/InteractableAreaController';
import PlayerController from '../../classes/PlayerController';
import * as TownControllerHooks from '../../classes/TownController';
import { BoundingBox } from '../../types/CoveyTownSocket';
import InteractableAreasList from './InteractableAreasList';

import ConnectFourAreaController from '../../classes/interactable/ConnectFourAreaController';
import ViewingAreaController from '../../classes/interactable/ViewingAreaController';
jest.setTimeout(70000); // in milliseconds, needed to avoid weird timeout issues
const useActiveInteractableAreasSpy = jest.spyOn(TownControllerHooks, 'useActiveInteractableAreas');
const useInteractableAreasOccupantsSpy = jest.spyOn(
  InteractableAreaHooks,
  'useInteractableAreaOccupants',
);

const useInteractableFriendlyNameSpy = jest.spyOn(
  InteractableAreaHooks,
  'useInteractableAreaFriendlyName',
);

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
function createGameAreaForTesting(params?: {
  id?: string;
  occupants?: PlayerController[];
  inactive?: boolean;
}) {
  const ret = mock<ConnectFourAreaController>();
  ret.occupants = params?.occupants || [];
  //We need to manually set these properties for the mock.
  //eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  ret.friendlyName = `game area label for id ${params?.id || nanoid()}`;
  //eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  ret.type = GAME_AREA_TYPE;
  //eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  ret.id = params?.id || nanoid();
  //eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  ret.isActive = params?.inactive ? () => false : () => true;

  return ret;
}

function createViewingAreaForTesting(params?: {
  id?: string;
  occupants?: PlayerController[];
  inactive?: boolean;
}) {
  const ret = mock<ViewingAreaController>();
  ret.occupants = params?.occupants || [];
  // We need to manually set these properties for the mock.
  //eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  ret.friendlyName = `viewing area label for id ${params?.id || nanoid()}`;
  //eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  ret.type = VIEWING_AREA_TYPE;
  //eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  ret.id = params?.id || nanoid();
  //eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  ret.isActive = params?.inactive ? () => false : () => true;

  return ret;
}
process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL = 'testing';

describe('[T5.2] InteractableAreasList', () => {
  /**
   * Check that the conversation areas rendered precisely follow the specification for formatting,
   * and that each area has the correct topic and players.
   */
  const expectProperlyRenderedInteractableAreas = async (
    renderData: RenderResult,
    areas: GenericInteractableAreaController[],
    players?: Map<GenericInteractableAreaController, PlayerController[]>,
  ) => {
    if (areas.length === 0) {
      const expectedText = await renderData.findByText('No active areas');
      expect(expectedText).toBeDefined();
      const areaLabels = renderData.queryAllByRole('heading', { level: 3 });
      expect(areaLabels.length).toBe(0);
    } else {
      const areasByType = new Map<string, GenericInteractableAreaController[]>();
      areas.forEach(eachArea => {
        const areasThisType = areasByType.get(eachArea.type) ?? [];
        areasThisType.push(eachArea);
        areasByType.set(eachArea.type, areasThisType);
      });
      //Check each area type
      const types = Array.from(areasByType.keys()).sort();
      const typeLabels = await renderData.findAllByRole('heading', { level: 3 });
      expect(typeLabels.length).toBe(types.length);
      for (let j = 0; j < types.length; j += 1) {
        expect(typeLabels[j]).toHaveTextContent(`${types[j]}s`);
        const areasThisType = areasByType.get(types[j]) ?? [];
        const areaTypeParent = typeLabels[j].parentElement;
        if (!areaTypeParent) throw new Error('areaTypeParent is undefined');
        const areaLabels = await findAllByRole(areaTypeParent, 'heading', { level: 4 });

        expect(areaLabels.length).toBe(areasThisType.length);
        areasThisType.sort((a1, a2) => {
          if (a1.occupants.length === a2.occupants.length)
            return a1.id.localeCompare(a2.id, undefined, { numeric: true, sensitivity: 'base' });
          else return a2.occupants.length - a1.occupants.length;
        });
        for (let i = 0; i < areasThisType.length; i += 1) {
          expect(areaLabels[i]).toHaveTextContent(`${areasThisType[i].friendlyName}`);
          const expectedPlayers = players?.get(areasThisType[i]);
          if (expectedPlayers) {
            const { parentElement } = areaLabels[i];
            expect(parentElement).toBeDefined();
            if (parentElement) {
              const playerNodes = await findAllByRole(parentElement, 'listitem');
              const playerNames = playerNodes.map(node => node.textContent);
              //Check to make sure that the right number of players are listed
              expect(playerNames.length).toBe(expectedPlayers.length);

              const expectedNames = expectedPlayers.map(player => player.userName);
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
    }
  };

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
  const playersByArea = new Map<GenericInteractableAreaController, PlayerController[]>();
  let gameAreas: GenericInteractableAreaController[] = [];
  let conversationAreas: GenericInteractableAreaController[] = [];
  let viewingAreas: GenericInteractableAreaController[] = [];

  let renderInteractableAreasList: (
    expectedAreas?: GenericInteractableAreaController[],
  ) => RenderResult;

  const numAreas = 20;

  beforeEach(async () => {
    mockClear(useActiveInteractableAreasSpy); //Be sure to clear the past calls, otherwise we'll have test order dependencies

    useInteractableAreasOccupantsSpy.mockReset();
    useInteractableAreasOccupantsSpy.mockImplementation(
      (area: GenericInteractableAreaController) => area.occupants,
    );

    useInteractableFriendlyNameSpy.mockReset();
    useInteractableFriendlyNameSpy.mockImplementation(
      (area: GenericInteractableAreaController) => area.friendlyName,
    );

    //Build up some default testing data
    playersByArea.clear();
    gameAreas = [];
    conversationAreas = [];
    viewingAreas = [];
    const interactableTypes = ['conversation', 'game', 'viewing'];
    let allPlayers: PlayerController[] = [];
    for (const interactableType of interactableTypes) {
      for (let areaID = 0; areaID < numAreas; areaID += 1) {
        const playersInThisArea: PlayerController[] = [];
        const playersThisArea = areaID > 5 ? Math.random() * 10 : numAreas - areaID + 1;
        for (let playerNum = 0; playerNum < playersThisArea; playerNum += 1) {
          playersInThisArea.push(
            new PlayerController(
              `${interactableType}area${areaID}.${playerNum}playerID:${nanoid()}`,
              `${interactableType}area${areaID}.${playerNum}userName:${nanoid()}`,
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
        if (interactableType === 'conversation') {
          const area = createConversationForTesting({
            label: `conversation area label for id ${areaID}`,
            occupants: playersInThisArea,
          });
          playersByArea.set(area, playersInThisArea);
          conversationAreas.push(area);
        } else if (interactableType === 'game') {
          const area = createGameAreaForTesting({
            id: `game area id for id ${areaID}`,
            occupants: playersInThisArea,
          });
          gameAreas.push(area);
          playersByArea.set(area, playersInThisArea);
        } else if (interactableType === 'viewing') {
          const area = createViewingAreaForTesting({
            id: `viewing area id for id ${areaID}`,
            occupants: playersInThisArea,
          });
          playersByArea.set(area, playersInThisArea);
          viewingAreas.push(area);
        }
      }
    }

    renderInteractableAreasList = (areasToRender?: GenericInteractableAreaController[]) => {
      if (areasToRender === undefined) {
        areasToRender = conversationAreas.concat(gameAreas, viewingAreas);
      }
      useActiveInteractableAreasSpy.mockReturnValue(
        areasToRender.filter(eachArea => eachArea.isActive()),
      );

      return render(
        <ChakraProvider>
          <React.StrictMode>
            <InteractableAreasList />
          </React.StrictMode>
        </ChakraProvider>,
      );
    };
  });
  describe('When there are inactive interactable areas', () => {
    it('Does not display inactive areas', async () => {
      const activeAndInactiveAreas = [
        createConversationForTesting({ emptyTopic: true }),
        conversationAreas[0],
        createConversationForTesting({ emptyTopic: true }),
        conversationAreas[1],
        gameAreas[0],
        createGameAreaForTesting({ inactive: true }),
        gameAreas[1],
        viewingAreas[0],
        createViewingAreaForTesting({ inactive: true }),
        viewingAreas[1],
        createViewingAreaForTesting({ inactive: true }),
      ];
      const renderData = renderInteractableAreasList(activeAndInactiveAreas);
      await expectProperlyRenderedInteractableAreas(renderData, [
        conversationAreas[0],
        conversationAreas[1],
        gameAreas[0],
        gameAreas[1],
        viewingAreas[0],
        viewingAreas[1],
      ]);
    });
    it('Displays the text "No active areas" when none are active', async () => {
      const inactiveAreas = [
        createConversationForTesting({ emptyTopic: true }),
        createConversationForTesting({ emptyTopic: true }),
        createViewingAreaForTesting({ inactive: true }),
        createGameAreaForTesting({ inactive: true }),
      ];
      const renderData = renderInteractableAreasList(inactiveAreas);
      await expectProperlyRenderedInteractableAreas(renderData, []);
    });
    it('Shows "No active areas" when there are no interactable areas at all', async () => {
      const renderData = renderInteractableAreasList([]);
      await expectProperlyRenderedInteractableAreas(renderData, []);
    });
  });
  describe('When there are active interactable areas', () => {
    it('Renders the friendly name', async () => {
      const areasProvidedInSortOrder = [
        conversationAreas[0],
        conversationAreas[1],
        gameAreas[0],
        gameAreas[1],
        viewingAreas[0],
        viewingAreas[1],
      ];
      const renderData = renderInteractableAreasList(areasProvidedInSortOrder);
      await expectProperlyRenderedInteractableAreas(renderData, areasProvidedInSortOrder);
    });
    it('Sorts the interactable areas by their occupants descending then by label, ascending', async () => {
      const shuffledAreas = conversationAreas
        .concat(gameAreas, viewingAreas)
        .sort(() => 0.5 - Math.random());
      const renderData = renderInteractableAreasList(shuffledAreas);
      await expectProperlyRenderedInteractableAreas(renderData, shuffledAreas);
    });
    it('Displays player names in the order provided', async () => {
      const areasProvidedInSortOrder = conversationAreas.concat(gameAreas, viewingAreas);
      const renderData = renderInteractableAreasList(areasProvidedInSortOrder);
      await expectProperlyRenderedInteractableAreas(
        renderData,
        areasProvidedInSortOrder,
        playersByArea,
      );
    });
    it('Uses the occupants provided by useInteractableAreaOccupants', async () => {
      const areasProvidedInSortOrder = [conversationAreas[0], conversationAreas[1]];
      const renderData = await renderInteractableAreasList(areasProvidedInSortOrder);
      await expectProperlyRenderedInteractableAreas(
        renderData,
        areasProvidedInSortOrder,
        playersByArea,
      );
      useInteractableAreasOccupantsSpy.mockImplementation(
        (area: GenericInteractableAreaController) => area.occupants.slice(1),
      );
      const updatedPlayersByArea = new Map<GenericInteractableAreaController, PlayerController[]>();
      for (const area of areasProvidedInSortOrder) {
        updatedPlayersByArea.set(area, playersByArea.get(area)?.slice(1) || []);
      }
      renderData.rerender(
        <ChakraProvider>
          <React.StrictMode>
            <InteractableAreasList />
          </React.StrictMode>
        </ChakraProvider>,
      );
      await expectProperlyRenderedInteractableAreas(
        renderData,
        areasProvidedInSortOrder,
        updatedPlayersByArea,
      );
    });
    it('Displays the friendlyName from the useInteractableAreaFriendlyName hook', async () => {
      const renderData = await renderInteractableAreasList([conversationAreas[0]]);
      await expectProperlyRenderedInteractableAreas(renderData, [conversationAreas[0]]);
      expect(renderData.queryByText(conversationAreas[0].friendlyName)).toBeDefined();
      const mutatedFriendlyName = `mutated friendly name ${nanoid()}`;
      useInteractableFriendlyNameSpy.mockImplementation(() => mutatedFriendlyName);
      renderData.rerender(
        <ChakraProvider>
          <React.StrictMode>
            <InteractableAreasList />
          </React.StrictMode>
        </ChakraProvider>,
      );
      expect(renderData.queryByText(conversationAreas[0].friendlyName)).toBeNull(); //Old name gone
      expect(renderData.queryByText(mutatedFriendlyName)).toBeDefined(); //New name there
    });
  });
});
