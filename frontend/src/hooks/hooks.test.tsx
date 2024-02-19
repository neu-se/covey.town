import { cleanup, render, RenderResult } from '@testing-library/react';
import { MockProxy } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import * as React from 'react';
import { act } from 'react-dom/test-utils';
import ConversationAreaController, {
  ConversationAreaEvents,
  NO_TOPIC_STRING,
  useConversationAreaTopic,
} from '../classes/interactable/ConversationAreaController';
import {
  BaseInteractableEventMap,
  GenericInteractableAreaController,
  useInteractableAreaFriendlyName,
  useInteractableAreaOccupants,
} from '../classes/interactable/InteractableAreaController';
import PlayerController from '../classes/PlayerController';
import TownController, {
  TownEvents,
  useActiveConversationAreas,
  usePlayers,
  useTownSettings,
} from '../classes/TownController';
import { EventNames, getTownEventListener, mockTownController } from '../TestUtils';
import * as useTownController from './useTownController';
describe('TownController-Dependent Hooks', () => {
  let useTownControllerSpy: jest.SpyInstance<TownController, []>;
  let townController: MockProxy<TownController>;
  let players: PlayerController[];

  beforeAll(() => {
    useTownControllerSpy = jest.spyOn(useTownController, 'default');
  });
  function getSingleListenerRemoved<Ev extends EventNames<TownEvents>>(
    eventName: Ev,
  ): TownEvents[Ev] {
    const listeners = townController.removeListener.mock.calls.filter(
      eachCall => eachCall[0] === eventName,
    );
    if (listeners.length !== 1) {
      throw new Error(
        `Expected to find exactly one removeListener call for ${eventName}, but found ${listeners.length}`,
      );
    }
    return listeners[0][1] as unknown as TownEvents[Ev];
  }
  function getSingleListenerAdded<Ev extends EventNames<TownEvents>>(
    eventName: Ev,
    spy = townController.addListener,
  ): TownEvents[Ev] {
    const listeners = spy.mock.calls.filter(eachCall => eachCall[0] === eventName);
    if (listeners.length !== 1) {
      throw new Error(
        `Expected to find exactly one addListener call for ${eventName}, but found ${listeners.length}`,
      );
    }
    return listeners[0][1] as unknown as TownEvents[Ev];
  }
  describe('usePlayers', () => {
    let friendlyName: string;
    let townIsPubliclyListed: boolean;
    let hookReturnValue: PlayerController[];
    let renderData: RenderResult;
    function TestComponent() {
      hookReturnValue = usePlayers();
      return null;
    }
    beforeEach(() => {
      friendlyName = nanoid();
      townIsPubliclyListed = true;
      townController = mockTownController({
        friendlyName,
        townIsPubliclyListed,
        players,
      });
      useTownControllerSpy.mockReturnValue(townController);

      renderData = render(<TestComponent />);
    });
    it('Returns initial state for the town', () => {
      expect(hookReturnValue).toEqual(players);
    });
    it('Updates players in response to playersChanged events', () => {
      const listener = getSingleListenerAdded('playersChanged');
      act(() => {
        listener([]);
      });
      expect(hookReturnValue).toEqual([]);
      act(() => {
        listener(players);
      });
      expect(hookReturnValue).toEqual(players);
    });
    it('Adds exactly one listener', () => {
      const listener = getSingleListenerAdded('playersChanged');
      act(() => {
        listener([]);
      });
      getSingleListenerAdded('playersChanged');
    });
    it('Removes the listener when the component is unmounted', () => {
      const listenerAdded = getSingleListenerAdded('playersChanged');
      act(() => {
        listenerAdded([]);
      });
      cleanup();
      const listenerRemoved = getSingleListenerRemoved('playersChanged');
      expect(listenerRemoved).toBe(listenerAdded);
    });
    it('Adds a listener on first render and does not re-register a listener on each render', () => {
      getSingleListenerAdded('playersChanged');
      renderData.rerender(<TestComponent />);
      renderData.rerender(<TestComponent />);
      renderData.rerender(<TestComponent />);
      getSingleListenerAdded('playersChanged');
    });

    it('Removes the listener if the townController changes and adds one to the new controller', () => {
      const addCall = getSingleListenerAdded('playersChanged');
      const newController = mockTownController({
        friendlyName: nanoid(),
        townID: nanoid(),
        players: [],
      });

      useTownControllerSpy.mockReturnValue(newController);
      renderData.rerender(<TestComponent />);
      expect(getSingleListenerRemoved('playersChanged')).toBe(addCall);

      getSingleListenerAdded('playersChanged', newController.addListener);
    });
  });
  describe('useActiveConversationAreas', () => {
    let conversationAreas: ConversationAreaController[];

    let hookReturnValue: ConversationAreaController[] = [];
    let renderData: RenderResult;

    function TestComponent() {
      hookReturnValue = useActiveConversationAreas();
      return null;
    }
    beforeEach(() => {
      conversationAreas = [];
      players = [];

      for (let i = 0; i < 10; i++) {
        conversationAreas.push(new ConversationAreaController(nanoid(), `topic${i}`));
      }

      for (let i = 0; i < 10; i++) {
        players.push(
          new PlayerController(nanoid(), nanoid(), { moving: false, rotation: 'back', x: 0, y: 1 }),
        );
      }

      conversationAreas[0].occupants.push(players[0]);
      conversationAreas[1].occupants.push(players[1]);

      townController = mockTownController({
        conversationAreas,
      });
      useTownControllerSpy.mockReturnValue(townController);

      renderData = render(<TestComponent />);
    });
    it('Returns an initial state of the active conversation areas', () => {
      hookReturnValue.sort((a, b) => (a.topic && b.topic ? a.topic.localeCompare(b.topic) : 0));
      expect(hookReturnValue).toEqual([conversationAreas[0], conversationAreas[1]]);
    });
    it('Updates its value in response to conversationAreasChanged events', () => {
      act(() => {
        const listener = getSingleListenerAdded('interactableAreasChanged');
        conversationAreas[2].occupants.push(players[2]);
        listener();
      });
      hookReturnValue.sort((a, b) => (a.topic && b.topic ? a.topic.localeCompare(b.topic) : 0));
      expect(hookReturnValue).toEqual([
        conversationAreas[0],
        conversationAreas[1],
        conversationAreas[2],
      ]);
    });
    it('Only adds a listener once', () => {
      // Check that there was one listener added
      getSingleListenerAdded('interactableAreasChanged');
      // Trigger re-render
      act(() => {
        const listener = getTownEventListener(townController, 'interactableAreasChanged');
        conversationAreas[2].occupants.push(players[2]);
        listener();
      });
      renderData.rerender(<TestComponent />);
      // Should still be one
      getSingleListenerAdded('interactableAreasChanged');
    });
    it('Removes the listener when the component is unmounted', () => {
      const addCall = getSingleListenerAdded('interactableAreasChanged');
      cleanup();
      const removeCall = getSingleListenerRemoved('interactableAreasChanged');
      expect(addCall).toBe(removeCall);
    });
    it('Adds a listener on first render and does not re-register a listener on each render', () => {
      getSingleListenerAdded('interactableAreasChanged');
      renderData.rerender(<TestComponent />);
      renderData.rerender(<TestComponent />);
      renderData.rerender(<TestComponent />);
      getSingleListenerAdded('interactableAreasChanged');
    });

    it('Removes the listener if the townController changes and adds one to the new controller', () => {
      const addCall = getSingleListenerAdded('interactableAreasChanged');
      const newController = mockTownController({
        friendlyName: nanoid(),
        townID: nanoid(),
        conversationAreas: [],
      });

      useTownControllerSpy.mockReturnValue(newController);
      renderData.rerender(<TestComponent />);
      expect(getSingleListenerRemoved('interactableAreasChanged')).toBe(addCall);

      getSingleListenerAdded('interactableAreasChanged', newController.addListener);
    });
  });

  describe('useTownSettings', () => {
    let friendlyName: string;
    let townIsPubliclyListed: boolean;
    let hookReturnValue: { friendlyName: string; isPubliclyListed: boolean };
    let renderData: RenderResult;
    function TestComponent() {
      hookReturnValue = useTownSettings();
      return null;
    }
    beforeEach(() => {
      friendlyName = nanoid();
      townIsPubliclyListed = true;
      townController = mockTownController({
        friendlyName,
        townIsPubliclyListed,
      });
      useTownControllerSpy.mockReturnValue(townController);

      renderData = render(<TestComponent />);
    });
    it('Returns initial state for the town', () => {
      expect(hookReturnValue.isPubliclyListed).toBe(townIsPubliclyListed);
      expect(hookReturnValue.friendlyName).toBe(friendlyName);
    });
    it('Updates isPubliclyListed in response to townSettingsUpdated events', () => {
      const listener = getSingleListenerAdded('townSettingsUpdated');
      const newTownIsPubliclyListed = false;
      act(() => {
        listener({ isPubliclyListed: newTownIsPubliclyListed });
      });
      expect(hookReturnValue.friendlyName).toBe(friendlyName);
      expect(hookReturnValue.isPubliclyListed).toBe(newTownIsPubliclyListed);
    });
    it('Updates friendlyName in response to townSettingsUpdated events', () => {
      const listener = getSingleListenerAdded('townSettingsUpdated');
      const newFriendlyName = nanoid();
      act(() => {
        listener({ friendlyName: newFriendlyName });
      });
      expect(hookReturnValue.friendlyName).toBe(newFriendlyName);
      expect(hookReturnValue.isPubliclyListed).toBe(townIsPubliclyListed);
    });
    it('Updates both settings in response to townSettingsUpdated events', () => {
      const listener = getSingleListenerAdded('townSettingsUpdated');
      const newFriendlyName = nanoid();
      const newTownIsPubliclyListed = false;
      act(() => {
        listener({ friendlyName: newFriendlyName, isPubliclyListed: newTownIsPubliclyListed });
      });
      expect(hookReturnValue.friendlyName).toBe(newFriendlyName);
      expect(hookReturnValue.isPubliclyListed).toBe(newTownIsPubliclyListed);
    });
    it('Adds exactly one listener', () => {
      const listener = getSingleListenerAdded('townSettingsUpdated');
      const newFriendlyName = nanoid();
      const newTownIsPubliclyListed = false;
      act(() => {
        listener({ friendlyName: newFriendlyName, isPubliclyListed: newTownIsPubliclyListed });
      });
      getSingleListenerAdded('townSettingsUpdated');
    });
    it('Removes the listener when the component is unmounted', () => {
      const listenerAdded = getSingleListenerAdded('townSettingsUpdated');
      const newFriendlyName = nanoid();
      const newTownIsPubliclyListed = false;
      act(() => {
        listenerAdded({ friendlyName: newFriendlyName, isPubliclyListed: newTownIsPubliclyListed });
      });
      cleanup();
      const listenerRemoved = getSingleListenerRemoved('townSettingsUpdated');
      expect(listenerRemoved).toBe(listenerAdded);
    });
    it('Adds a listener on first render and does not re-register a listener on each render', () => {
      getSingleListenerAdded('townSettingsUpdated');
      renderData.rerender(<TestComponent />);
      renderData.rerender(<TestComponent />);
      renderData.rerender(<TestComponent />);
      getSingleListenerAdded('townSettingsUpdated');
    });

    it('Removes the listener if the townController changes and adds one to the new controller', () => {
      const addCall = getSingleListenerAdded('townSettingsUpdated');
      const newController = mockTownController({
        friendlyName: nanoid(),
        townID: nanoid(),
        conversationAreas: [],
      });

      useTownControllerSpy.mockReturnValue(newController);
      renderData.rerender(<TestComponent />);
      expect(getSingleListenerRemoved('townSettingsUpdated')).toBe(addCall);

      getSingleListenerAdded('townSettingsUpdated', newController.addListener);
    });
  });
});

describe('ConversationAreaController hooks', () => {
  let conversationAreaController: ConversationAreaController;
  let addListenerSpy: jest.SpyInstance<
    ConversationAreaController,
    Parameters<ConversationAreaController['addListener']>
  >;
  let removeListenerSpy: jest.SpyInstance<
    ConversationAreaController,
    Parameters<ConversationAreaController['removeListener']>
  >;

  beforeEach(() => {
    conversationAreaController = new ConversationAreaController(nanoid(), nanoid());
    addListenerSpy = jest.spyOn(conversationAreaController, 'addListener');
    removeListenerSpy = jest.spyOn(conversationAreaController, 'removeListener');
  });
  function getSingleListenerAdded<
    Ev extends EventNames<ConversationAreaEvents> | EventNames<BaseInteractableEventMap>,
  >(
    eventName: Ev,
    spy = addListenerSpy,
  ): Ev extends EventNames<ConversationAreaEvents>
    ? ConversationAreaEvents[Ev]
    : Ev extends EventNames<BaseInteractableEventMap>
    ? BaseInteractableEventMap[Ev]
    : never {
    const addedListeners = spy.mock.calls.filter(eachCall => eachCall[0] === eventName);
    if (addedListeners.length !== 1) {
      throw new Error(
        `Expected to find exactly one addListener call for ${eventName} but found ${addedListeners.length}`,
      );
    }
    return addedListeners[0][1] as unknown as Ev extends EventNames<ConversationAreaEvents>
      ? ConversationAreaEvents[Ev]
      : Ev extends EventNames<BaseInteractableEventMap>
      ? BaseInteractableEventMap[Ev]
      : never;
  }
  function getSingleListenerRemoved<
    Ev extends EventNames<ConversationAreaEvents> | EventNames<BaseInteractableEventMap>,
  >(
    eventName: Ev,
  ): Ev extends EventNames<ConversationAreaEvents>
    ? ConversationAreaEvents[Ev]
    : Ev extends EventNames<BaseInteractableEventMap>
    ? BaseInteractableEventMap[Ev]
    : never {
    const removedListeners = removeListenerSpy.mock.calls.filter(
      eachCall => eachCall[0] === eventName,
    );
    if (removedListeners.length !== 1) {
      throw new Error(
        `Expected to find exactly one removeListeners call for ${eventName} but found ${removedListeners.length}`,
      );
    }
    return removedListeners[0][1] as unknown as Ev extends EventNames<ConversationAreaEvents>
      ? ConversationAreaEvents[Ev]
      : Ev extends EventNames<BaseInteractableEventMap>
      ? BaseInteractableEventMap[Ev]
      : never;
  }
  describe('useConversationAreaOccupants', () => {
    let hookReturnValue: PlayerController[];
    let testPlayers: PlayerController[];
    let renderData: RenderResult;
    function TestComponent(props: { controller?: ConversationAreaController }) {
      hookReturnValue = useInteractableAreaOccupants(
        props.controller || conversationAreaController,
      );
      return null;
    }
    beforeEach(() => {
      testPlayers = [];
      for (let i = 0; i < 10; i++) {
        testPlayers.push(
          new PlayerController(nanoid(), nanoid(), { moving: false, rotation: 'back', x: 0, y: 1 }),
        );
      }
      conversationAreaController.occupants = [testPlayers[0], testPlayers[1], testPlayers[2]];
      renderData = render(<TestComponent />);
    });
    it('Returns an initial state of the players in the area', () => {
      expect(hookReturnValue).toEqual([testPlayers[0], testPlayers[1], testPlayers[2]]);
    });
    it('Updates the occupants list in response to occupantsChange events', () => {
      act(() => {
        conversationAreaController.occupants = [testPlayers[0]];
      });
      expect(hookReturnValue).toEqual([testPlayers[0]]);
      //Make sure that re-rendering didn't add another listener
      getSingleListenerAdded('occupantsChange');
    });
    it('Removes its update listener when the component unmounts', () => {
      const listenerAdded = getSingleListenerAdded('occupantsChange');
      cleanup();
      const listenerRemoved = getSingleListenerRemoved('occupantsChange');
      expect(listenerAdded).toBe(listenerRemoved);
    });
    it('Adds a listener on first render and does not re-register a listener on each render', () => {
      getSingleListenerAdded('occupantsChange');
      renderData.rerender(<TestComponent />);
      renderData.rerender(<TestComponent />);
      renderData.rerender(<TestComponent />);
      getSingleListenerAdded('occupantsChange');
    });
    it('Removes its listener and registers a new one if the area changes', () => {
      const added = getSingleListenerAdded('occupantsChange');

      const newController = new ConversationAreaController(nanoid(), nanoid());
      const newAdded = jest.spyOn(newController, 'addListener');

      renderData.rerender(<TestComponent controller={newController} />);

      //Make sure old was removed
      expect(getSingleListenerRemoved('occupantsChange')).toBe(added);

      //Make sure new added
      getSingleListenerAdded('occupantsChange', newAdded);
    });
  });
  describe('useConversationAreaTopic', () => {
    let hookReturnValue: string;
    let renderData: RenderResult;
    function TestComponent(props: { controller?: ConversationAreaController }) {
      hookReturnValue = useConversationAreaTopic(props.controller || conversationAreaController);
      return null;
    }
    beforeEach(() => {
      renderData = render(<TestComponent />);
    });
    it('Returns an initial state of the topic for the area', () => {
      expect(hookReturnValue).toEqual(conversationAreaController.topic);
    });
    it('Returns NO_TOPIC_STRING if the topic is undefined', () => {
      act(() => {
        conversationAreaController.topic = undefined;
      });
      expect(hookReturnValue).toEqual(NO_TOPIC_STRING);
    });
    it('Updates the topic in response to topicChange events', () => {
      const newTopic = nanoid();
      act(() => {
        conversationAreaController.topic = newTopic;
      });
      expect(hookReturnValue).toEqual(newTopic);
      // Make sure that re-rendering didn't add another listener
      getSingleListenerAdded('topicChange');
    });
    it('Removes its update listener when the component unmounts', () => {
      const listenerAdded = getSingleListenerAdded('topicChange');
      cleanup();
      const listenerRemoved = getSingleListenerRemoved('topicChange');
      expect(listenerRemoved).toBe(listenerAdded);
    });
    it('Adds a listener on first render and does not re-register a listener on each render', () => {
      getSingleListenerAdded('topicChange');
      renderData.rerender(<TestComponent />);
      renderData.rerender(<TestComponent />);
      renderData.rerender(<TestComponent />);
      getSingleListenerAdded('topicChange');
    });
    it('Removes its listener and registers a new one if the area changes', () => {
      const added = getSingleListenerAdded('topicChange');

      const newController = new ConversationAreaController(nanoid(), nanoid());
      const newAdded = jest.spyOn(newController, 'addListener');

      renderData.rerender(<TestComponent controller={newController} />);

      //Make sure old was removed
      expect(getSingleListenerRemoved('topicChange')).toBe(added);

      //Make sure new added
      getSingleListenerAdded('topicChange', newAdded);
    });
  });
});

describe('InteractableAreaController hooks', () => {
  let interactableAreaController: ConversationAreaController;
  let addListenerSpy: jest.SpyInstance<
    GenericInteractableAreaController,
    Parameters<GenericInteractableAreaController['addListener']>
  >;
  let removeListenerSpy: jest.SpyInstance<
    GenericInteractableAreaController,
    Parameters<GenericInteractableAreaController['removeListener']>
  >;

  beforeEach(() => {
    interactableAreaController = new ConversationAreaController(nanoid(), nanoid());
    addListenerSpy = jest.spyOn(interactableAreaController, 'addListener');
    removeListenerSpy = jest.spyOn(interactableAreaController, 'removeListener');
  });
  function getSingleListenerAdded<Ev extends EventNames<BaseInteractableEventMap>>(
    eventName: Ev,
    spy = addListenerSpy,
  ): BaseInteractableEventMap[Ev] {
    const addedListeners = spy.mock.calls.filter(eachCall => eachCall[0] === eventName);
    if (addedListeners.length !== 1) {
      throw new Error(
        `Expected to find exactly one addListener call for ${eventName} but found ${addedListeners.length}`,
      );
    }
    return addedListeners[0][1] as unknown as Ev extends EventNames<ConversationAreaEvents>
      ? ConversationAreaEvents[Ev]
      : Ev extends EventNames<BaseInteractableEventMap>
      ? BaseInteractableEventMap[Ev]
      : never;
  }
  function getSingleListenerRemoved<Ev extends EventNames<BaseInteractableEventMap>>(
    eventName: Ev,
  ): BaseInteractableEventMap[Ev] {
    const removedListeners = removeListenerSpy.mock.calls.filter(
      eachCall => eachCall[0] === eventName,
    );
    if (removedListeners.length !== 1) {
      throw new Error(
        `Expected to find exactly one removeListeners call for ${eventName} but found ${removedListeners.length}`,
      );
    }
    return removedListeners[0][1] as unknown as Ev extends EventNames<ConversationAreaEvents>
      ? ConversationAreaEvents[Ev]
      : Ev extends EventNames<BaseInteractableEventMap>
      ? BaseInteractableEventMap[Ev]
      : never;
  }
  describe('useInteractableAreaOccupants', () => {
    let hookReturnValue: PlayerController[];
    let testPlayers: PlayerController[];
    let renderData: RenderResult;
    function TestComponent(props: { controller?: GenericInteractableAreaController }) {
      hookReturnValue = useInteractableAreaOccupants(
        props.controller || interactableAreaController,
      );
      return null;
    }
    beforeEach(() => {
      testPlayers = [];
      for (let i = 0; i < 10; i++) {
        testPlayers.push(
          new PlayerController(nanoid(), nanoid(), { moving: false, rotation: 'back', x: 0, y: 1 }),
        );
      }
      interactableAreaController.occupants = [testPlayers[0], testPlayers[1], testPlayers[2]];
      renderData = render(<TestComponent />);
    });
    it('Returns an initial state of the players in the area', () => {
      expect(hookReturnValue).toEqual([testPlayers[0], testPlayers[1], testPlayers[2]]);
    });
    it('Updates the occupants list in response to occupantsChange events', () => {
      act(() => {
        interactableAreaController.occupants = [testPlayers[0]];
      });
      expect(hookReturnValue).toEqual([testPlayers[0]]);
      //Make sure that re-rendering didn't add another listener
      getSingleListenerAdded('occupantsChange');
    });
    it('Removes its update listener when the component unmounts', () => {
      const listenerAdded = getSingleListenerAdded('occupantsChange');
      cleanup();
      const listenerRemoved = getSingleListenerRemoved('occupantsChange');
      expect(listenerAdded).toBe(listenerRemoved);
    });
    it('Adds a listener on first render and does not re-register a listener on each render', () => {
      getSingleListenerAdded('occupantsChange');
      renderData.rerender(<TestComponent />);
      renderData.rerender(<TestComponent />);
      renderData.rerender(<TestComponent />);
      getSingleListenerAdded('occupantsChange');
    });
    it('Removes its listener and registers a new one if the area changes', () => {
      const added = getSingleListenerAdded('occupantsChange');

      const newController = new ConversationAreaController(nanoid(), nanoid());
      const newAdded = jest.spyOn(newController, 'addListener');

      renderData.rerender(<TestComponent controller={newController} />);

      //Make sure old was removed
      expect(getSingleListenerRemoved('occupantsChange')).toBe(added);

      //Make sure new added
      getSingleListenerAdded('occupantsChange', newAdded);
    });
  });
  describe('[T5.1] useInteractableAreaFriendlyName', () => {
    let hookReturnValue: string;
    let renderData: RenderResult;
    function TestComponent(props: { controller?: GenericInteractableAreaController }) {
      hookReturnValue = useInteractableAreaFriendlyName(
        props.controller || interactableAreaController,
      );
      return null;
    }
    beforeEach(() => {
      renderData = render(<TestComponent />);
    });
    it('Returns an initial state of friendly name of the area', () => {
      expect(hookReturnValue).toEqual(interactableAreaController.friendlyName);
    });
    it('Updates the friendly name in response to topicChange events', () => {
      const newFriendlyName = `New friendly name ${nanoid()}`;
      act(() => {
        interactableAreaController.topic = newFriendlyName;
      });
      expect(hookReturnValue).toEqual(newFriendlyName);
      // Make sure that re-rendering didn't add another listener
      getSingleListenerAdded('friendlyNameChange');
    });
    it('Removes its update listener when the component unmounts', () => {
      const listenerAdded = getSingleListenerAdded('friendlyNameChange');
      cleanup();
      const listenerRemoved = getSingleListenerRemoved('friendlyNameChange');
      expect(listenerRemoved).toBe(listenerAdded);
    });
    it('Adds a listener on first render and does not re-register a listener on each render', () => {
      getSingleListenerAdded('friendlyNameChange');
      renderData.rerender(<TestComponent />);
      renderData.rerender(<TestComponent />);
      renderData.rerender(<TestComponent />);
      getSingleListenerAdded('friendlyNameChange');
    });
    it('Removes its listener and registers a new one if the area changes', () => {
      const added = getSingleListenerAdded('friendlyNameChange');

      const newController = new ConversationAreaController(nanoid(), nanoid());
      const newAdded = jest.spyOn(newController, 'addListener');

      renderData.rerender(<TestComponent controller={newController} />);

      //Make sure old was removed
      expect(getSingleListenerRemoved('friendlyNameChange')).toBe(added);

      //Make sure new added
      getSingleListenerAdded('friendlyNameChange', newAdded);
    });
  });
});
