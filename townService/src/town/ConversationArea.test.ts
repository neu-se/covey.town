import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { getLastEmittedEvent } from '../TestUtils';
import { TownEmitter } from '../types/CoveyTownSocket';
import ConversationArea from './ConversationArea';

describe('ConversationArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: ConversationArea;
  const townEmitter = mock<TownEmitter>();
  const topic = nanoid();
  const id = nanoid();
  let newPlayer: Player;

  beforeEach(() => {
    mockClear(townEmitter);
    testArea = new ConversationArea({ topic, id, occupantsByID: [] }, testAreaBox, townEmitter);
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testArea.add(newPlayer);
  });
  describe('add', () => {
    it('Adds the player to the occupants list and emits an interactableUpdate event', () => {
      expect(testArea.occupantsByID).toEqual([newPlayer.id]);

      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({ topic, id, occupantsByID: [newPlayer.id] });
    });
    it("Sets the player's conversationLabel and emits an update for their location", () => {
      expect(newPlayer.location.interactableID).toEqual(id);

      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toEqual(id);
    });
  });
  describe('remove', () => {
    it('Removes the player from the list of occupants and emits an interactableUpdate event', () => {
      // Add another player so that we are not also testing what happens when the last player leaves
      const extraPlayer = new Player(nanoid(), mock<TownEmitter>());
      testArea.add(extraPlayer);
      testArea.remove(newPlayer);

      expect(testArea.occupantsByID).toEqual([extraPlayer.id]);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({ topic, id, occupantsByID: [extraPlayer.id] });
    });
    it("Clears the player's conversationLabel and emits an update for their location", () => {
      testArea.remove(newPlayer);
      expect(newPlayer.location.interactableID).toBeUndefined();
      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toBeUndefined();
    });
    it('Clears the topic of the conversation area when the last occupant leaves', () => {
      testArea.remove(newPlayer);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({ topic: undefined, id, occupantsByID: [] });
      expect(testArea.topic).toBeUndefined();
    });
  });
  test('toModel sets the ID, topic and occupantsByID and sets no other properties', () => {
    const model = testArea.toModel();
    expect(model).toEqual({
      id,
      topic,
      occupantsByID: [newPlayer.id],
    });
  });
  describe('fromMapObject', () => {
    it('Throws an error if the width or height are missing', () => {
      expect(() =>
        ConversationArea.fromMapObject(
          { id: 1, name: nanoid(), visible: true, x: 0, y: 0 },
          townEmitter,
        ),
      ).toThrowError();
    });
    it('Creates a new conversation area using the provided boundingBox and id, with an empty occupants list', () => {
      const x = 30;
      const y = 20;
      const width = 10;
      const height = 20;
      const name = 'name';
      const val = ConversationArea.fromMapObject(
        { x, y, width, height, name, id: 10, visible: true },
        townEmitter,
      );
      expect(val.boundingBox).toEqual({ x, y, width, height });
      expect(val.id).toEqual(name);
      expect(val.topic).toBeUndefined();
      expect(val.occupantsByID).toEqual([]);
    });
  });
});
