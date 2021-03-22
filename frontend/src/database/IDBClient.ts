import { CoveyUserProfile } from "../CoveyTypes";

/**
 * Interface for a database client
 */
export default interface IDBClient {
    /**
     * Save a user profile. If user profile exists, update.
     * If not, insert new user profile.
     * @param userProfile user profile to save
     */
    saveUserProfile(userProfile: CoveyUserProfile): Promise<CoveyUserProfile>;

    /**
     * Search a user profile by their user ID.
     * @param userId 
     */
    searchUserProfileById(userId: string): Promise<CoveyUserProfile | null>
}