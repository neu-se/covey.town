import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import {
  BoundingBox,
  Interactable,
  KnuckleGameArea as KnuckleGameAreaModel,
  TownEmitter,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class KnuckleGameArea extends InteractableArea {
  public toModel(): Interactable {
    throw new Error('Method not implemented.');
  }
  // The current tuple of players in game.
  // the spectators are not included in this list
  protected _players: Player[] = [];
  
  /** The game area is "active" when _players.length > 1 */
  public get isActive(): boolean {
    return this._players.length > 1;
  }

  /**
   * Creates a new KnuckleGameArea
   *
   * @param knuckleGameAreaModel model containing this area's current topic and its ID
   * @param coordinates  the bounding box that defines this conversation area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { id }: KnuckleGameAreaModel,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._players = [];
  }

}