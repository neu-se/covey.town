import React from 'react';
import Player from '../classes/Player';

/**
 * Hint: You will never need to use this directly. Instead, use the
 * `useNearbyPlayers` hook.
 */
const Context = React.createContext<Player[]>([]);

export default Context;
