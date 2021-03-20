import React, { useState, useEffect } from "react";
import UserContext from '../../contexts/UserContext';
import { AuthState, User } from "../../CoveyTypes";
import RealmClient from "../../database/RealmClient";

export default function AuthGuard(props: any): JSX.Element {
  const { children } = props;
  const user = RealmClient.getCurrentUser();
  
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: user? user?.state === 'active' : false,
    currentUser: user,
  });
  useEffect(() => { }, [authState.isLoggedIn]);

  const handleLogout = () => {
    user?.logOut();
    setAuthState({ isLoggedIn: false, currentUser: null });
  };

  const authInfo = React.useMemo(() => {
    const { isLoggedIn, currentUser } = authState;
    const value: User = {
      isLoggedIn,
      currentUser,
      actions: { handleLogout, setAuthState },
    };
    return value;
  }, [authState]);

  return (
    <UserContext.Provider value={authInfo}>
      {children}
    </UserContext.Provider>
  );
}
