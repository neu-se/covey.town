import React from 'react';
import TownController from '../classes/TownController';

/**
 * Hint: You will never need to use this directly. Instead, use the
 * `useTownController` hook.
 */
const context = React.createContext<TownController | null>(null);

export default context;
