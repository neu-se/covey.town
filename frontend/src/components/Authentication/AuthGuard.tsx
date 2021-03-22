import React, { useState, useEffect, useCallback } from "react";
import UserContext from '../../contexts/UserContext';
import { AuthState } from "../../CoveyTypes";
import useAuthentication from '../../hooks/useAuthentication';


interface AuthGuardProps {
  children: React.ReactNode
}

/**
 * Authentication guard service to store a user's authentication state.
 * @param param0 props
 */
export default function AuthGuard({ children }: AuthGuardProps): JSX.Element {
  const auth = useAuthentication();

  const user = auth.getCurrentUser();
  
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: user? user?.state === 'active' : false,
    currentUser: user,
  });
  useEffect(() => { }, [authState.isLoggedIn]);

  const handleLogout = useCallback(() => {
    user?.logOut();
    setAuthState({ isLoggedIn: false, currentUser: null });
  }, [user]);

  const authInfo = React.useMemo(() => {
    const { isLoggedIn, currentUser } = authState;
    const value: AuthState = {
      isLoggedIn,
      currentUser,
      actions: { handleLogout, setAuthState },
    };
    return value;
  }, [authState, handleLogout]);

  return (
    <UserContext.Provider value={authInfo}>
      {children}
    </UserContext.Provider>
  );
}
