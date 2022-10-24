import Player from '../lib/Player';
import { BoundingBox, Interactable, PlayerLocation, TownEmitter } from '../types/CoveyTownSocket';

export const PLAYER_SPRITE_WIDTH = 32;
export const PLAYER_SPRITE_HEIGHT = 64;

export default abstract class InteractableArea {
  /* The unique ID of this area */
  private readonly _id: string;

  /* The x coordinate of the top left of this area */
  private _x: number;

  /* The y coordinate of the top left of this area */
  private _y: number;

  /* The height of this area */
  private _width: number;

  /* The height of this area */
  private _height: number;

  /* The current set of players in this area. Maintained by the InteractableArea class. */
  protected _occupants: Player[] = [];

  /* An emitter that can be used to broadcast messages to all players in this town */
  private _townEmitter: TownEmitter;

  public get id() {
    return this._id;
  }

  public get occupantsByID(): string[] {
    return this._occupants.map(eachPlayer => eachPlayer.id);
  }

  public get isActive(): boolean {
    return this._occupants.length > 0;
  }

  public get boundingBox(): BoundingBox {
    return { x: this._x, y: this._y, width: this._width, height: this._height };
  }

  /**
   * Constructs a new InteractableArea
   * @param id Unique ID for this area
   * @param boundingBox The rectangular coordinates that define this InteractableArea, where (x,y) specify the top-left corner
   * @param townEmitter An emitter that can be used to broadcast events to players in this town
   */
  public constructor(id: string, { x, y, width, height }: BoundingBox, townEmitter: TownEmitter) {
    this._id = id;
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
    this._townEmitter = townEmitter;
  }

  /**
   * Adds a new player to this interactable area.
   *
   * Adds the player to this area's occupants array, sets the player's interactableID, informs players in the town
   * that the player's interactableID has changed, and informs players in the town that the area has changed.
   *
   * Assumes that the player specified is a member of this town.
   *
   * @param player Player to add
   */
  public add(player: Player): void {
    this._occupants.push(player);
    player.location.interactableID = this.id;
    this._townEmitter.emit('playerMoved', player.toPlayerModel());
    this._emitAreaChanged();
  }

  /**
   * Removes a player from this interactable area.
   *
   * Removes the player from this area's occupants array, clears the player's interactableID, informs players in the town
   * that the player's interactableID has changed, and informs players in the town that the area has changed
   *
   * Assumes that the player specified is an occupant of this interactable area
   *
   * @param player Player to remove
   */
  public remove(player: Player): void {
    this._occupants = this._occupants.filter(eachPlayer => eachPlayer !== player);
    player.location.interactableID = undefined;
    this._townEmitter.emit('playerMoved', player.toPlayerModel());
    this._emitAreaChanged();
  }

  /**
   * Given a list of players, adds all of the players that are within this interactable area
   *
   * @param allPlayers list of players to examine and potentially add to this interactable area
   */
  public addPlayersWithinBounds(allPlayers: Player[]) {
    allPlayers
      .filter(eachPlayer => this.contains(eachPlayer.location))
      .forEach(eachContainedPlayer => this.add(eachContainedPlayer));
  }

  /**
   * Tests if a player location is contained within this InteractableArea.
   *
   * This interactable area contains a PlayerLocation if any part of the player is within any part of this area.
   * A PlayerLocation specifies only the center (x,y) coordinate of the player; the width and height of the player
   * are PLAYER_SPRITE_WIDTH and PLAYER_SPRITE_HEIGHT, respectively
   *
   * @param location location to check
   *
   * @returns true if location is within this area
   */
  public contains(location: PlayerLocation): boolean {
    return (
      location.x + PLAYER_SPRITE_WIDTH / 2 > this._x &&
      location.x - PLAYER_SPRITE_WIDTH / 2 < this._x + this._width &&
      location.y + PLAYER_SPRITE_HEIGHT / 2 > this._y &&
      location.y - PLAYER_SPRITE_HEIGHT / 2 < this._y + this._height
    );
  }

  /**
   * Tests if another InteractableArea overlaps with this one. Two InteractableArea's overlap if it is possible for one player
   * to overlap with both of them simultaneously. That is: There is an overlap if the rectangles of the two InteractableAreas
   * overlap, where the rectangles are expanded by PLAYER_SPRITE_WIDTH/2 in each X dimension and PLAYER_SPRITE_HEIGHT/2 in each Y
   * dimension.
   *
   * @param otherInteractable interactable to checko
   *
   * @returns true if a player could be contained within both InteractableAreas simultaneously
   */
  public overlaps(otherInteractable: InteractableArea): boolean {
    const toRectPoints = ({ _x, _y, _width, _height }: InteractableArea) => ({
      x1: _x - PLAYER_SPRITE_WIDTH / 2,
      x2: _x + _width + PLAYER_SPRITE_WIDTH / 2,
      y1: _y - PLAYER_SPRITE_HEIGHT / 2,
      y2: _y + _height + PLAYER_SPRITE_HEIGHT / 2,
    });
    const rect1 = toRectPoints(this);
    const rect2 = toRectPoints(otherInteractable);
    const noOverlap =
      rect1.x1 >= rect2.x2 || rect2.x1 >= rect1.x2 || rect1.y1 >= rect2.y2 || rect2.y1 >= rect1.y2;
    return !noOverlap;
  }

  /**
   * Emits an event to the players in the town notifying them that this InteractableArea has changed, passing
   * the model for this InteractableArea in that event.
   */
  protected _emitAreaChanged() {
    this._townEmitter.emit('interactableUpdate', this.toModel());
  }

  /**
   * Converts this InteractableArea into a simple structure that is suitable for transmission over a socket
   * to other clients. The value returned must not contain references to internal server state (e.g. the townEmitter);
   * otherwise serialization errors will occur when attempting to transmit it
   */
  public abstract toModel(): Interactable;
}
