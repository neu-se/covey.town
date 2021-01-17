import React from 'react';
import { CoveyAppState } from '../CoveyTypes';

/**
 * Hint: You will never need to use this directly. Instead, use the
 * `useCoveyAppState` hook.
 */
const Context = React.createContext<CoveyAppState | null>(null);

export default Context;
