import _ from 'lodash';
import { useEffect, useState } from 'react';
import { EventMap } from 'typed-emitter';
import {
  Interactable as InteractableAreaModel,
  InteractableID,
  PlayerID,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';

export type BaseInteractableEventMap = EventMap & {
  occupantsChange: (newOccupants: PlayerController[]) => void;
  friendlyNameChange: (newFriendlyName: string) => void;
};

export type GenericInteractableAreaController = InteractableAreaController<
  BaseInteractableEventMap,
  InteractableAreaModel
>;

export const CONVERSATION_AREA_TYPE = 'Conversation Area';
export const VIEWING_AREA_TYPE = 'Viewing Area';
export const GAME_AREA_TYPE = 'Game Area';
/**
 * A InteractableAreaController manages the local behavior of a interactable area in the frontend,
 * implementing the logic to bridge between the townService's interpretation of interactable areas and the
 * frontend's. The InteractableAreaController emits events when the interactable area changes.
 */
export default abstract class InteractableAreaController<
  EmittedEventType extends BaseInteractableEventMap,
  InteractableModelType extends InteractableAreaModel,
> {
  private readonly _id: InteractableID;

  private _occupants: PlayerController[] = [];

  private _listeners: Map<keyof EmittedEventType, EmittedEventType[keyof EmittedEventType][]> =
    new Map();

  constructor(id: InteractableID) {
    this._id = id;
  }

  get id() {
    return this._id;
  }

  /**
   * Add a listener for an event emitted by this InteractableAreaController
   * @param event
   * @param listener
   * @returns
   */
  public addListener<E extends keyof EmittedEventType>(
    event: E,
    listener: EmittedEventType[E],
  ): this {
    const listeners = this._listeners.get(event) ?? [];
    listeners.push(listener);
    this._listeners.set(event, listeners);
    return this;
  }

  /**
   * Remove a listener for an event emitted by this InteractableAreaController
   * @param event
   * @param listener
   * @returns
   */
  public removeListener<E extends keyof EmittedEventType>(
    event: E,
    listener: EmittedEventType[E],
  ): this {
    const listeners = this._listeners.get(event) ?? [];
    _.remove(listeners, l => l === listener);
    this._listeners.set(event, listeners);
    return this;
  }

  /**
   * Emit an event to all listeners for that event
   * @param event
   * @param args
   * @returns
   */
  public emit<E extends keyof EmittedEventType>(
    event: E,
    ...args: Parameters<EmittedEventType[E]>
  ): boolean {
    const listeners = this._listeners.get(event) ?? [];
    listeners.forEach(listener => listener(...args));
    return true;
  }

  public get occupantsByID(): PlayerID[] {
    return this._occupants.map(eachOccupant => eachOccupant.id);
  }

  public get occupants(): PlayerController[] {
    return this._occupants;
  }

  /**
   * Set the occupants of this interactable area, emitting an event if the occupants change.
   */
  public set occupants(newOccupants: PlayerController[]) {
    if (
      newOccupants.length !== this._occupants.length ||
      _.xor(newOccupants, this._occupants).length > 0
    ) {
      //TODO - Bounty for figuring out how to make the types work here
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.emit('occupantsChange', newOccupants);
      this._occupants = newOccupants;
    }
  }

  abstract toInteractableAreaModel(): InteractableModelType;

  /**
   * Update the state of this interactable area from a new interactable area model, and a list of occupants.
   * @param newModel
   * @param occupants
   */
  updateFrom(newModel: InteractableModelType, occupants: PlayerController[]): void {
    this.occupants = occupants;
    this._updateFrom(newModel);
  }

  /**
   * Update the state of this interactable area from a new interactable area model.
   * @param newModel
   */
  protected abstract _updateFrom(newModel: InteractableModelType): void;

  public abstract isActive(): boolean;

  isEmpty(): boolean {
    return this._occupants.length === 0;
  }

  /**
   * Return a friendly name for this interactable area type, suitable for display to users.
   */
  public abstract get friendlyName(): string;

  /**
   * Return a string that identifies the type of this interactable area.
   */
  public abstract get type(): string;
}
/**
 * A react hook to retrieve the occupants of a ConversationAreaController, returning an array of PlayerController.
 *
 * This hook will re-render any components that use it when the set of occupants changes.
 */
export function useInteractableAreaOccupants(
  area: GenericInteractableAreaController,
): PlayerController[] {
  const [occupants, setOccupants] = useState(area.occupants);
  useEffect(() => {
    area.addListener('occupantsChange', setOccupants);
    return () => {
      area.removeListener('occupantsChange', setOccupants);
    };
  }, [area]);
  return occupants;
}

/**
 * A react hook to retrieve the friendly name of an InteractableAreaController, returning a string.
 *
 * This hook will re-render any components that use it when the friendly name changes.
 *
 */
export function useInteractableAreaFriendlyName(area: GenericInteractableAreaController): string {
  const [friendlyName, setFriendlyName] = useState(area.friendlyName);
  useEffect(() => {
    area.addListener('friendlyNameChange', setFriendlyName);
    return () => {
      area.removeListener('friendlyNameChange', setFriendlyName);
    };
  }, [area]);
  return friendlyName;
}
