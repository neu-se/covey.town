import React, { useState, useEffect } from "react";
import UserContext from '../../contexts/UserContext';

export default function AuthGuard(props: any) {
  const { client, children } = props;
  const [authState, setAuthState] = useState({
    isLoggedIn: client.getCurrentUser()? client.getCurrentUser().state === 'active' : false,
    currentUser: client.getCurrentUser(),
  });
  useEffect(() => { }, [authState.isLoggedIn]);

  const handleLogout = () => {
    client.getCurrentUser().currentUser?.logOut();
    setAuthState({ isLoggedIn: false, currentUser: null });
  };

  const authInfo = React.useMemo(() => {
    const { isLoggedIn, currentUser } = authState;
    const value = {
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
