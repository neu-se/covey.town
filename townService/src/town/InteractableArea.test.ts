import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { defaultLocation, getLastEmittedEvent } from '../TestUtils';
import { BoundingBox, Interactable, TownEmitter, XY } from '../types/CoveyTownSocket';
import ConversationArea from './ConversationArea';
import InteractableArea, { PLAYER_SPRITE_HEIGHT, PLAYER_SPRITE_WIDTH } from './InteractableArea';

class TestInteractableArea extends InteractableArea {
  public toModel(): Interactable {
    return { id: this.id, occupantsByID: [] };
  }
}
const HALF_W = PLAYER_SPRITE_WIDTH / 2;
const HALF_H = PLAYER_SPRITE_HEIGHT / 2;

describe('InteractableArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: InteractableArea;
  const id = nanoid();
  let newPlayer: Player;
  const townEmitter = mock<TownEmitter>();

  beforeEach(() => {
    mockClear(townEmitter);
    testArea = new TestInteractableArea(id, testAreaBox, townEmitter);
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testArea.add(newPlayer);
  });
  describe('add', () => {
    it('Adds the player to the occupants list', () => {
      expect(testArea.occupantsByID).toEqual([newPlayer.id]);
    });
    it("Sets the player's conversationLabel and emits an update for their location", () => {
      expect(newPlayer.location.interactableID).toEqual(id);

      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toEqual(id);
    });
  });
  describe('remove', () => {
    it('Removes the player from the list of occupants', () => {
      testArea.remove(newPlayer);
      expect(testArea.occupantsByID).toEqual([]);
    });
    it("Clears the player's conversationLabel and emits an update for their location", () => {
      mockClear(townEmitter);
      testArea.remove(newPlayer);
      expect(newPlayer.location.interactableID).toBeUndefined();
      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toBeUndefined();
    });
  });
  describe('isActive', () => {
    it('Returns true when there are players in the area', () => {
      expect(testArea.isActive).toBe(true);
    });
    it('Returns false when there are no players in the area', () => {
      testArea.remove(newPlayer);
      expect(testArea.isActive).toBe(false);
    });
  });
  describe('addPlayersWithinBounds', () => {
    let playersInArea: Player[];
    let playersNotInArea: Player[];
    beforeEach(() => {
      playersInArea = [];
      playersNotInArea = [];
      const box = testArea.boundingBox;
      for (let i = 0; i < 10; i++) {
        const player = new Player(nanoid(), mock<TownEmitter>());
        player.location.x = box.x + box.width / 2;
        player.location.y = box.y + box.height / 2;
        playersInArea.push(player);
      }
      for (let i = 0; i < 10; i++) {
        const player = new Player(nanoid(), mock<TownEmitter>());
        player.location.x = -100;
        player.location.y = -100;
        playersNotInArea.push(player);
      }
      const mixedPlayers = playersInArea
        .concat(playersNotInArea)
        .sort((a, b) => a.id.localeCompare(b.id));
      testArea.addPlayersWithinBounds(mixedPlayers);
    });
    it('Does not include players not within the area', () => {
      playersNotInArea.forEach(player =>
        expect(testArea.occupantsByID.includes(player.id)).toBe(false),
      );
    });
    it('Includes all players that are within the area', () => {
      playersInArea.forEach(player =>
        expect(testArea.occupantsByID.includes(player.id)).toBe(true),
      );
      expect(playersInArea.length).toEqual(playersInArea.length);
    });
  });
  describe('contains', () => {
    const { x, y, width, height } = testAreaBox;
    it.each<XY>([
      { x: x + width / 2, y: y + width / 2 }, // at the center
      { x: x + 10 + width / 2, y: y + 10 + width / 2 }, // offset from center
      { x: x - 1 + width, y: y + 1 }, // on top right
      { x: x + 1, y: y + 1 }, // on top left
      { x: x - 1 + width, y: y - 1 + height }, // on bottom right
      { x: x + 1, y: y - 1 + height }, // on bottom left
    ])('Returns true for locations that are inside of the area %p', (location: XY) => {
      expect(testArea.contains({ ...defaultLocation(), x: location.x, y: location.y })).toBe(true);
    });
    it.each<XY>([
      { x: x - 1 + HALF_W + width, y: y + 1 - HALF_H }, // on top right
      { x: x + 1 - HALF_W, y: y + 1 - HALF_H }, // on top left
      { x: x - 1 + HALF_W + width, y: y - 1 + HALF_H + height }, // on bottom right
      { x: x + 1 - HALF_W, y: y - 1 + HALF_H + height }, // on bottom left
    ])(
      'Returns true for locations that are outside of the area, but are included due to the player sprite size overlapping with the target area',
      (location: XY) => {
        expect(testArea.contains({ ...defaultLocation(), x: location.x, y: location.y })).toBe(
          true,
        );
      },
    );
    it.each<XY>([
      { x: x + HALF_W + width, y: y - HALF_H }, // on top right
      { x: x - HALF_W, y: y - HALF_H }, // on top left
      { x: x + HALF_W + width, y: y + HALF_H + height }, // on bottom right
      { x: x - HALF_W, y: y + HALF_H + height }, // on bottom left
    ])('Returns false for locations that exactly hit the edge of the area', (location: XY) => {
      expect(testArea.contains({ ...defaultLocation(), x: location.x, y: location.y })).toBe(false);
    });
    it.each<XY>([
      { x: x + width * 2, y: y - height }, // off top right
      { x: x - width, y: y - width }, // off top left
      { x: x + width * 2, y: y + height * 2 }, // off bottom right
      { x: x - width, y: y + height * 2 }, // off bottom left
      { x: x + 1, y: y - height }, // off top
      { x: x - width, y: y + 1 }, // off left
      { x: x + width * 2, y: y + 1 }, // off right
      { x: x + 1, y: y + height * 2 }, // off bottom
    ])('Returns false for locations that are outside of the area', (location: XY) => {
      expect(testArea.contains({ ...defaultLocation(), x: location.x, y: location.y })).toBe(false);
    });
  });
  describe('overlaps', () => {
    /*
        To simplify these test inputs, x and y refer to the center of the comparison box,
        and height/width are distance from center
        */
    const cheight = testAreaBox.height / 2;
    const cwidth = testAreaBox.width / 2;
    const cx = testAreaBox.x + cwidth;
    const cy = testAreaBox.y + cheight;

    const { x, y, height, width } = testAreaBox;

    it.each<BoundingBox>([
      { x: cx, y: cy, width: 2, height: 2 },
      { x: cx + 4, y: cy + 4, width: 2, height: 2 },
      { x: cx + 4, y: cy + 4, width: 2, height: 2 },
    ])('Returns true for locations that are contained entirely %p', (intersectBox: BoundingBox) => {
      expect(
        testArea.overlaps(
          new ConversationArea(
            { id: 'testArea', occupantsByID: [] },
            intersectBox,
            mock<TownEmitter>(),
          ),
        ),
      ).toBe(true);
    });
    it.each<BoundingBox>([
      { x: x - 50, y: y - 50, width: 100, height: 100 }, // TL
      { x: x - 50, y: y + height - 50, width: 100, height: 100 }, // BL
      { x: x + width - 50, y: y - 50, width: 100, height: 100 }, // TR
      { x: x + width - 50, y: y + height - 50, width: 100, height: 100 }, // BR
      {
        x: x - PLAYER_SPRITE_WIDTH / 2,
        y: y - PLAYER_SPRITE_HEIGHT / 2,
        width: PLAYER_SPRITE_WIDTH + 1,
        height: PLAYER_SPRITE_HEIGHT + 1,
      }, // TL, plus offset
      {
        x: x - PLAYER_SPRITE_WIDTH / 2,
        y: y + height + PLAYER_SPRITE_HEIGHT / 2,
        width: PLAYER_SPRITE_WIDTH + 1,
        height: PLAYER_SPRITE_HEIGHT + 1,
      }, // BL, plus offset
      {
        x: x + width + PLAYER_SPRITE_WIDTH / 2,
        y: y - PLAYER_SPRITE_HEIGHT / 2,
        width: PLAYER_SPRITE_WIDTH + 1,
        height: PLAYER_SPRITE_HEIGHT + 1,
      }, // TR, plus offset
      {
        x: x + width + PLAYER_SPRITE_WIDTH / 2,
        y: y + height + PLAYER_SPRITE_HEIGHT / 2,
        width: PLAYER_SPRITE_WIDTH + 1,
        height: PLAYER_SPRITE_HEIGHT + 1,
      }, // BR, plus offset
    ])(
      'Returns true for locations that are overlapping with edges %p',
      (intersectBox: BoundingBox) => {
        expect(
          testArea.overlaps(
            new ConversationArea(
              { id: 'testArea', occupantsByID: [] },
              intersectBox,
              mock<TownEmitter>(),
            ),
          ),
        ).toBe(true);
      },
    );
    it.each<BoundingBox>([
      { x: x - 50, y: y - 50, width: 10, height: 10 }, // TL
      { x: x - 50, y: y + height + 50, width: 10, height: 10 }, // BL
      { x: x + width + 50, y: y - 50, width: 100, height: 100 }, // TR
      { x: x + width + 50, y: y + height + 50, width: 100, height: 100 }, // BR
      {
        x: x - PLAYER_SPRITE_WIDTH * 1.5,
        y: y - PLAYER_SPRITE_HEIGHT * 1.5,
        width: PLAYER_SPRITE_WIDTH / 2,
        height: PLAYER_SPRITE_HEIGHT / 2,
      }, // TL, plus offset
      {
        x: x - PLAYER_SPRITE_WIDTH,
        y: y + height + PLAYER_SPRITE_HEIGHT,
        width: PLAYER_SPRITE_WIDTH,
        height: PLAYER_SPRITE_HEIGHT,
      }, // BL, plus offset
      {
        x: x + width + PLAYER_SPRITE_WIDTH,
        y: y - PLAYER_SPRITE_HEIGHT,
        width: PLAYER_SPRITE_WIDTH,
        height: PLAYER_SPRITE_HEIGHT,
      }, // TR, plus offset
      {
        x: x + width + PLAYER_SPRITE_WIDTH,
        y: y + height + PLAYER_SPRITE_HEIGHT,
        width: PLAYER_SPRITE_WIDTH,
        height: PLAYER_SPRITE_HEIGHT,
      }, // BR, plus offset
    ])('Returns false for locations that have no overlap %p', (intersectBox: BoundingBox) => {
      expect(
        testArea.overlaps(
          new ConversationArea(
            { id: 'testArea', occupantsByID: [] },
            intersectBox,
            mock<TownEmitter>(),
          ),
        ),
      ).toBe(false);
    });
  });
});
