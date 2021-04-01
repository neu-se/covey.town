import { CoveyUser, CoveyUserProfile } from "../../CoveyTypes";

/**
 * Interface for a database client
 */
export default interface IDBClient {
    /**
     * Save a user profile. If user profile exists, update.
     * If not, insert new user profile.
     * @param userProfile user profile to save
     */
    saveUserProfile(userId:string, userProfile: CoveyUserProfile): Promise<CoveyUserProfile>;

    /**
     * Get a Covey User from the database
     * @param userId 
     */
    getUser(userId:string): Promise<CoveyUser | null>;
    
    /**
     * Save a Covey User to the database
     * @param coveyUser 
     */
    saveUser(coveyUser: CoveyUser): Promise<CoveyUser>;
}