import { AuthState, CoveyUser, EmailPasswordCredential, GoogleAuthInfo } from "../../CoveyTypes";

/**
 * Authentication interface to perform user authentication operations.
 */
export default interface IAuth {
    /**
     * Get the current realm user if authenticated.
     */
    getCurrentUser(): Promise<CoveyUser | null>;

    /**
     * Login using email and password. After login, create a user profile if not exist.
     * @param credential email and password credentail
     * @param setAuthState callback method to update the authentication state of authentication
     */
    loginWithEmailPassword(credential: EmailPasswordCredential, setAuthState: React.Dispatch<React.SetStateAction<AuthState>>): Promise<CoveyUser>;
    
    /**
     * Register the user using email and password
     * @param credential
     */
    registerUserEmailPassword(credential: EmailPasswordCredential): Promise<void>;


    /**
     * Login the user using Google OAuth2.0
     * @param setAuthState callback method to update the authentication state of authentication
     */
    loginWithGoogle(googleAuthInfo: GoogleAuthInfo, setAuthState: React.Dispatch<React.SetStateAction<AuthState>>): Promise<CoveyUser>;

    /**
     * Send a password reset email
     * @param email target user email 
     */
    sendPasswordResetEmail(email: string): Promise<void>;
}