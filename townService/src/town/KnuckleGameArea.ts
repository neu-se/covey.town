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
  public board1: number[][] = [];
  public board2: number[][] = [];
  public players: Player[] = [];
  public gameRunning: boolean = false;
  public die1: number = 0;
  public die2: number = 0;
  public isItPlayerOneTurn: boolean = true;

  /** The area is "active" when there are players inside of it  */
  public get isActive(): boolean {
    return this._occupants.length > 0;
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
  }
  
  /**
   * Removes a player from this game area.
   * 
   * Extends the base behavior of InteractableArea to set the topic of this ConversationArea to undefined and
   * emit an update to other players in the town when the last player leaves.
   * 
   * @param player
   */
  public remove(player: Player) {
    super.remove(player);
    if (this._occupants.length === 0) {
      this._emitAreaChanged();
    }
  }

  /**
   * Adds a player to the tuple containing the currently playing players in this game area.
   * 
   * @param player
   * 
   * @returns true if the player was added to the game area, false if the player was already in the game area
   */
  public addPlayer(player: Player): boolean {
    if (this._occupants.includes(player) && this._occupants.length < 2) {
      this.players.push(player);
      return true;
    }
    return false;
  }

  /**
   * Rolls a dice for a given player and stores the result in associated player's die.
   *
   * @param player
   * 
   * @returns the value of the die rolled
   */
  public rollDie(): number {
    const die = Math.floor(Math.random() * 6) + 1;
    if (this.isItPlayerOneTurn) {
      this.die1 = die;
    }
    else {
      this.die2 = die;
    }
    return die;
  }

  /**
   * Allows a player to place a die on the board, clearing their die value.
   * 
   * @param row
   * @param column
   * 
   * @returns true if the player was able to place their die on the board, false if the player was not able to place their die on the board
   */
  public placeDie(row: number, column: number): boolean {
    if (this.isItPlayerOneTurn) {
      if (this.board1[row][column] === 0) {
        this.board1[row][column] = this.die1;
        this.die1 = 0;
        return true;
      }
    }
    else {
      if (this.board2[row][column] === 0) {
        this.board2[row][column] = this.die2;
        this.die2 = 0;
        return true;
      }
    }
    return false;
  }

  /**
   * Starts a game if:
   * 1. There are two players in occupants array
   * 2. The game is not already running
   * 
   * @returns true if the game was started, false if the game was not started
   */
  public startGame(): boolean {
    if (this._occupants.length === 2 && !this.gameRunning) {
      this.gameRunning = true;
      this.board1 = this.createBoard();
      this.board2 = this.createBoard();
      return true;
    }
    return false;
  }
  createBoard(): number[][] {
    const board: number[][] = [];
    for (let i = 0; i < 3; i++) {
      board.push([0, 0, 0]);
    }
    return board;
  }
  
}