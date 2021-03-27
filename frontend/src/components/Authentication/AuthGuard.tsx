import React, { useState, useEffect, useCallback } from "react";
import AuthInfoContext from '../../contexts/AuthInfoContext';
import { AuthInfo, AuthState } from "../../CoveyTypes";
import IAuth from "../../services/authentication/IAuth";
import RealmAuth from "../../services/authentication/RealmAuth";
import RealmApp from "../../services/database/RealmApp";


interface AuthGuardProps {
  children: React.ReactNode
}

/**
 * Authentication guard service to store a user's authentication state.
 * @param param0 props
 */
export default function AuthGuard({ children }: AuthGuardProps): JSX.Element {
  const auth: IAuth = RealmAuth.getInstance();

  const user = auth.getCurrentUser();

  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: user ? user?.isLoggedIn : false,
    currentUser: user
  });
  useEffect(() => { }, [authState.isLoggedIn]);

  const handleLogout = useCallback(async () => {
    if (!user) {
      return;
    }
    await user.actions.logout();
    // await RealmApp.getInstance().CurrentUser?.logOut();
    setAuthState({ isLoggedIn: false, currentUser: null });
  }, [user]);

  const authInfo = React.useMemo(() => {
    const { isLoggedIn, currentUser } = authState;
    const value: AuthInfo = {
      isLoggedIn,
      currentUser,
      actions: { handleLogout, setAuthState },
    };
    return value;
  }, [authState, handleLogout]);

  return (
    <AuthInfoContext.Provider value={authInfo}>
      {children}
    </AuthInfoContext.Provider>
  );
}
