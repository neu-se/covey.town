import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import {
  BoundingBox,
  ConversationArea as ConversationAreaModel,
  TownEmitter,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class ConversationArea extends InteractableArea {
  /* The topic of the conversation area, or undefined if it is not set */
  public topic?: string;

  /** The conversation area is "active" when there are players inside of it  */
  public get isActive(): boolean {
    return this._occupants.length > 0;
  }

  /**
   * Creates a new ConversationArea
   *
   * @param conversationAreaModel model containing this area's current topic and its ID
   * @param coordinates  the bounding box that defines this conversation area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { topic, id }: ConversationAreaModel,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this.topic = topic;
  }

  /**
   * Removes a player from this conversation area.
   *
   * Extends the base behavior of InteractableArea to set the topic of this ConversationArea to undefined and
   * emit an update to other players in the town when the last player leaves.
   *
   * @param player
   */
  public remove(player: Player) {
    super.remove(player);
    if (this._occupants.length === 0) {
      this.topic = undefined;
      this._emitAreaChanged();
    }
  }

  /**
   * Convert this ConversationArea instance to a simple ConversationAreaModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): ConversationAreaModel {
    return {
      id: this.id,
      occupantsByID: this.occupantsByID,
      topic: this.topic,
    };
  }

  /**
   * Creates a new ConversationArea object that will represent a Conversation Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this conversation area exists
   * @param broadcastEmitter An emitter that can be used by this conversation area to broadcast updates
   * @returns
   */
  public static fromMapObject(
    mapObject: ITiledMapObject,
    broadcastEmitter: TownEmitter,
  ): ConversationArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new ConversationArea({ id: name, occupantsByID: [] }, rect, broadcastEmitter);
  }
}
