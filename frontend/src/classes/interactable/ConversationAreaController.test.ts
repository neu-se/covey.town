import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { PlayerLocation } from '../../types/CoveyTownSocket';
import ConversationAreaController, { ConversationAreaEvents } from './ConversationAreaController';
import PlayerController from '../PlayerController';

describe('[T2] ConversationAreaController', () => {
  // A valid ConversationAreaController to be reused within the tests
  let testArea: ConversationAreaController;
  const mockListeners = mock<ConversationAreaEvents>();
  beforeEach(() => {
    const playerLocation: PlayerLocation = {
      moving: false,
      x: 0,
      y: 0,
      rotation: 'front',
    };
    testArea = new ConversationAreaController(nanoid(), nanoid());
    testArea.occupants = [
      new PlayerController(nanoid(), nanoid(), playerLocation),
      new PlayerController(nanoid(), nanoid(), playerLocation),
      new PlayerController(nanoid(), nanoid(), playerLocation),
    ];
    mockClear(mockListeners.occupantsChange);
    mockClear(mockListeners.topicChange);
    testArea.addListener('occupantsChange', mockListeners.occupantsChange);
    testArea.addListener('topicChange', mockListeners.topicChange);
  });
  describe('isEmpty', () => {
    it('Returns true if the occupants list is empty', () => {
      testArea.occupants = [];
      expect(testArea.isEmpty()).toBe(true);
    });
    it('Returns true if the topic is undefined', () => {
      testArea.topic = undefined;
      expect(testArea.isEmpty()).toBe(true);
    });
    it('Returns false if the occupants list is set and the topic is defined', () => {
      expect(testArea.isEmpty()).toBe(false);
    });
  });
  describe('setting the occupants property', () => {
    it('does not update the property if the new occupants are the same set as the old', () => {
      const origOccupants = testArea.occupants;
      const occupantsCopy = testArea.occupants.concat([]);
      const shuffledOccupants = occupantsCopy.reverse();
      testArea.occupants = shuffledOccupants;
      expect(testArea.occupants).toEqual(origOccupants);
      expect(mockListeners.occupantsChange).not.toBeCalled();
    });
    it('emits the occupantsChange event when setting the property and updates the model', () => {
      const newOccupants = testArea.occupants.slice(1);
      testArea.occupants = newOccupants;
      expect(testArea.occupants).toEqual(newOccupants);
      expect(mockListeners.occupantsChange).toBeCalledWith(newOccupants);
      expect(testArea.toInteractableAreaModel()).toEqual({
        id: testArea.id,
        topic: testArea.topic,
        occupants: testArea.occupants.map(eachOccupant => eachOccupant.id),
        type: 'ConversationArea',
      });
    });
  });
  describe('setting the topic property', () => {
    it('does not update the property if the topic is the same string', () => {
      const topicCopy = `${testArea.topic}`;
      testArea.topic = topicCopy;
      expect(mockListeners.topicChange).not.toBeCalled();
    });
    it('emits the topicChange event when setting the property and updates the model', () => {
      const newTopic = nanoid();
      testArea.topic = newTopic;
      expect(mockListeners.topicChange).toBeCalledWith(newTopic);
      expect(testArea.topic).toEqual(newTopic);
      expect(testArea.toInteractableAreaModel()).toEqual({
        id: testArea.id,
        topic: newTopic,
        occupants: testArea.occupants.map(eachOccupant => eachOccupant.id),
        type: 'ConversationArea',
      });
    });
  });
});
