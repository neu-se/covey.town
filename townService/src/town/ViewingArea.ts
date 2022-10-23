import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import {
  BoundingBox,
  TownEmitter,
  ViewingArea as ViewingAreaModel,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class ViewingArea extends InteractableArea {
  private _video?: string;

  private _isPlaying: boolean;

  private _elapsedTimeSec: number;

  public get video() {
    return this._video;
  }

  public get elapsedTimeSec() {
    return this._elapsedTimeSec;
  }

  public get isPlaying() {
    return this._isPlaying;
  }

  /**
   * Creates a new ViewingArea
   *
   * @param viewingArea model containing this area's starting state
   * @param coordinates the bounding box that defines this viewing area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
  public constructor(
    { id, isPlaying, elapsedTimeSec: progress, video }: ViewingAreaModel,
    coordinates: BoundingBox,
    townEmitter: TownEmitter,
  ) {
    super(id, coordinates, townEmitter);
    this._video = video;
    this._elapsedTimeSec = progress;
    this._isPlaying = isPlaying;
  }

  /**
   * Removes a player from this viewing area.
   *
   * When the last player leaves, this method clears the video of this area and
   * emits that update to all of the players
   *
   * @param player
   */
  public remove(player: Player): void {
    super.remove(player);
    if (this._occupants.length === 0) {
      this._video = undefined;
      this._emitAreaChanged();
    }
  }

  /**
   * Updates the state of this ViewingArea, setting the video, isPlaying and progress properties
   *
   * @param viewingArea updated model
   */
  public updateModel({ isPlaying, elapsedTimeSec: progress, video }: ViewingAreaModel) {
    this._video = video;
    this._isPlaying = isPlaying;
    this._elapsedTimeSec = progress;
  }

  /**
   * Convert this ViewingArea instance to a simple ViewingAreaModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): ViewingAreaModel {
    return {
      id: this.id,
      video: this._video,
      isPlaying: this._isPlaying,
      elapsedTimeSec: this._elapsedTimeSec,
    };
  }

  /**
   * Creates a new ViewingArea object that will represent a Viewing Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this viewing area exists
   * @param townEmitter An emitter that can be used by this viewing area to broadcast updates to players in the town
   * @returns
   */
  public static fromMapObject(mapObject: ITiledMapObject, townEmitter: TownEmitter): ViewingArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new ViewingArea({ isPlaying: false, id: name, elapsedTimeSec: 0 }, rect, townEmitter);
  }
}
