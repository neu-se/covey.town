import { CoveyUser, CoveyUserProfile, FriendRequest } from "../../CoveyTypes";

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

    /**
     * Get the friend reqeuests data of a user
     * @param userID 
     */
    getFriendRequests(userID: string): Promise<FriendRequest>;

    /**
     * Save the friend request data
     * @param friendRequest 
     */
    saveFriendRequests(friendRequest: FriendRequest): Promise<FriendRequest>;

}