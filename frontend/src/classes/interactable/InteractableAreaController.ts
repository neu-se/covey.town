import { EventsMap } from "@socket.io/component-emitter";
import { EventEmitter } from "stream";
import TypedEmitter, { EventMap } from "typed-emitter"
import { Interactable as InteractableAreaModel, InteractableID, PlayerID } from "../../types/CoveyTownSocket";
import PlayerController from "../PlayerController";
import _ from 'lodash';
import { useEffect, useState } from "react";

export type BaseInteractableEventMap = {
    occupantsChange: (newOccupants: PlayerController[]) => void;
}
export default abstract class InteractableAreaController<
    EmittedEventType extends EventMap, InteractableModelType extends InteractableAreaModel>
    {

    private readonly _id: InteractableID;
    private _occupants: PlayerController[] = [];
    private _listeners: Map<keyof EmittedEventType, EmittedEventType[keyof EmittedEventType][]> = new Map();

    constructor(id: InteractableID) {
        this._id = id;
    }

    get id() {
        return this._id;
    }

    public addListener<E extends keyof (EmittedEventType & BaseInteractableEventMap)>(event: E, listener: (EmittedEventType & BaseInteractableEventMap)[E]): this {
        const listeners = this._listeners.get(event) ?? [];
        listeners.push(listener);
        this._listeners.set(event, listeners);
        return this;
    }
    public removeListener<E extends keyof (EmittedEventType & BaseInteractableEventMap)>(event: E, listener: (EmittedEventType & BaseInteractableEventMap)[E]): this {
        const listeners = this._listeners.get(event) ?? [];
        _.remove(listeners, (l) => l === listener);
        this._listeners.set(event, listeners);
        return this;
    }

    emit<E extends keyof (EmittedEventType & BaseInteractableEventMap)>(event: E, ...args: Parameters<(EmittedEventType & BaseInteractableEventMap)[E]>): boolean {
        const listeners = this._listeners.get(event) ?? [];
        listeners.forEach((listener) => listener(...args));
        return true;
    }

    public get occupantsByID(): PlayerID[] {
        return this._occupants.map(eachOccupant => eachOccupant.id);
    }

    public get occupants(): PlayerController[] {
        return this._occupants;
    }

    public set occupants(newOccupants: PlayerController[]) {
        if (
            newOccupants.length !== this._occupants.length ||
            _.xor(newOccupants, this._occupants).length > 0
        ) {
            //TODO - is there a type-safe way to do this? Child interfaces might override occupantsChange with different types, hence the type warning
            //@ts-ignore
            this.emit('occupantsChange', newOccupants);
            this._occupants = newOccupants;
        }
    }

    abstract toInteractableAreaModel(): InteractableModelType;

    updateFrom(newModel: InteractableModelType, occupants: PlayerController[]): void {
        this.occupants = occupants;
        this._updateFrom(newModel);
    }
    protected abstract _updateFrom(newModel: InteractableModelType): void;
    
    public abstract isActive(): boolean;

    isEmpty(): boolean {
        return this._occupants.length === 0;
    }
}
/**
 * A react hook to retrieve the occupants of a ConversationAreaController, returning an array of PlayerController.
 *
 * This hook will re-render any components that use it when the set of occupants changes.
 */
export function useInteractableAreaOccupants<E extends BaseInteractableEventMap & EventMap,T extends InteractableAreaModel>(area: InteractableAreaController<E, T>): PlayerController[] {
    const [occupants, setOccupants] = useState(area.occupants);
    useEffect(() => {
      area.addListener('occupantsChange', setOccupants);
      return () => {
        area.removeListener('occupantsChange', setOccupants);
      };
    }, [area]);
    return occupants;
}