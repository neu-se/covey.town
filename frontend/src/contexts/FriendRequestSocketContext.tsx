import React from 'react';
import { SocketState } from '../CoveyTypes';



/**
 * Hint: You will never need to use this directly. Instead, use the
 * `useCoveyAppState` hook.
 */
const Context = React.createContext<SocketState>({
    friendRequestSocket: null,
    setFriendRequestSocket: () => {}
});

export default Context;
