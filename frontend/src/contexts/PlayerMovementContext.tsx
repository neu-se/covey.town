import React from 'react';
import { ServerPlayer } from '../classes/Player';

export type PlayerMovementCallback = (playerMoved: ServerPlayer) => void;

const Context = React.createContext<PlayerMovementCallback[]>([]);

export default Context;
