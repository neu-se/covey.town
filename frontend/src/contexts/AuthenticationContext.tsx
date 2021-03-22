import React from 'react';
import IAuth from '../components/Authentication/IAuth';

const Context = React.createContext<IAuth | undefined>(undefined);
export default Context;