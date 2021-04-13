import React from 'react';
import { IUserAccountAuthStatus, UserProfileContextType } from '../classes/UserAccount';

/**

 * Hint: You will never need to use this directly. Instead, use the

 * `useUserProfile` or `useMaybeUserProfile` hooks.

 */

const Context = React.createContext<UserProfileContextType | null>(null);

export const Provider: React.FunctionComponent = prop => {
  const [userProfile, setUserProfile] = React.useState<IUserAccountAuthStatus | null>(null);
  return (
    Context && (
      <Context.Provider value={{ userProfile, setUserProfile }}>{prop.children}</Context.Provider>
    )
  );
};

export default Context;
