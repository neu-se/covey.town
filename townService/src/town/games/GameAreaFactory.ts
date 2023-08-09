import { ITiledMapObject } from "@jonbell/tiled-map-type-guard";
import { BoundingBox, TownEmitter } from "../../types/CoveyTownSocket";
import InteractableArea from "../InteractableArea";
import TicTacToeGameArea from "./TicTacToeGameArea";

export default function GameAreaFactory(mapObject: ITiledMapObject,
    broadcastEmitter: TownEmitter): InteractableArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
        throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    const gameType = mapObject.properties?.find(prop => prop.name === 'type')?.value;
    if (gameType === 'TicTacToe') {
        return new TicTacToeGameArea(name, rect, broadcastEmitter);
    }
    throw new Error(`Unknown game area type ${mapObject.class}`);
}