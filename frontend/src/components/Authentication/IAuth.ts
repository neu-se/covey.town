import { User } from "realm-web";
import { AuthState, EmailPasswordCredential } from "../../CoveyTypes";

/**
 * Authentication interface to perform user authentication operations.
 */
export default interface IAuth {
    /**
     * Get the current realm user if authenticated.
     */
    getCurrentUser(): Realm.User | null;

    /**
     * Login using email and password. After login, create a user profile if not exist.
     * @param credential email and password credentail
     * @param setAuthState callback method to update the state of authentication
     */
    loginWithEmailPassword(credential: EmailPasswordCredential, setAuthState: React.Dispatch<React.SetStateAction<AuthState>>): Promise<User>;
    
    /**
     * Register the user using email and password
     * @param credential
     */
    registerUserEmailPassword(credential: EmailPasswordCredential): Promise<void>;
}