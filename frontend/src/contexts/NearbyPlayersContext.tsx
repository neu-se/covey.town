import React from 'react';
import { NearbyPlayers } from '../CoveyTypes';

/**
 * Hint: You will never need to use this directly. Instead, use the
 * `useCoveyAppState` hook.
 */
const Context = React.createContext<NearbyPlayers>({ nearbyPlayers: [] });

export default Context;
