import React, { useState, useEffect, useCallback } from "react";
import AuthInfoContext from '../../contexts/AuthInfoContext';
import { AuthInfo, AuthState } from "../../CoveyTypes";
import IDBClient from "../../services/database/IDBClient";
import RealmDBClient from "../../services/database/RealmDBClient";


interface AuthGuardProps {
  children: React.ReactNode
}

/**
 * Authentication guard service to store a user's authentication state.
 * @param param0 props
 */
export default function AuthGuard({ children }: AuthGuardProps): JSX.Element {
  const dbClient: IDBClient = RealmDBClient.getInstance();

  const [authState, setAuthState] = useState<AuthState>({
    currentUser: null
  });


  useEffect(() => {
  }, [authState]);

  /**
   * Handles logout operation
   * 1. Logouts the user
   * 2. Turns logged in status to false
   * 3. Removes user's current town
   */
  const handleLogout = useCallback(async () => {
    if (!authState.currentUser) {
      return;
    }
    await dbClient.saveUser(authState.currentUser);
    await authState.currentUser.actions.logout();
    setAuthState({ currentUser: null });
  }, [authState.currentUser, dbClient]);

  const authInfo = React.useMemo(() => {
    const value: AuthInfo = {
      currentUser: authState.currentUser,
      actions: { handleLogout, setAuthState },
    };
    return value;
  }, [authState, handleLogout, setAuthState]);

  return (
    <AuthInfoContext.Provider value={authInfo}>
      {children}
    </AuthInfoContext.Provider>
  );
}
