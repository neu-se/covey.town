import React from 'react';
import Player from '../classes/Player';

const Context = React.createContext<Player[]>([]);

export default Context;
