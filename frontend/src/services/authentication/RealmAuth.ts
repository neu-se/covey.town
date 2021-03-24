/* eslint-disable class-methods-use-this */
import { User } from "realm-web";
import { AuthState, CoveyUser, CoveyUserProfile, EmailPasswordCredential } from "../../CoveyTypes";
import RealmApp from "../database/RealmApp";
import IAuth from "./IAuth";
import IDBClient from "../database/IDBClient";
import RealmDBClient from "../database/RealmDBClient";

/**
 * Realm authentication provider class 
 */
export default class RealmAuth implements IAuth {

    /** singleton instance */
    private static _instance : RealmAuth;

    private _realmApp = RealmApp.getInstance();

    private _realmDBClient: IDBClient = RealmDBClient.getInstance();

    /** Get the singleton instance */
    static getInstance(): RealmAuth {
        if (RealmAuth._instance === undefined) {
            RealmAuth._instance = new RealmAuth();
          }
          return RealmAuth._instance;
    }

    async loginWithEmailPassword(credential: EmailPasswordCredential, setAuthState: React.Dispatch<React.SetStateAction<AuthState>>): Promise<CoveyUser> {

        const realmUser = await this._realmApp.loginWithEmailPassword(credential);

        const userProfile: CoveyUserProfile = {
            user_id: realmUser.customData.user_id,
            userName: realmUser.customData.userName,
            email: realmUser.customData.email,
            pfpURL: realmUser.customData.pfpURL,
            bio: realmUser.customData.bio,
        }
        const coveyUser: CoveyUser= {
            id: realmUser.id,
            isLoggedIn: realmUser.isLoggedIn,
            profile: userProfile,
            actions: {
                logout: realmUser.logOut
            }
        }

        setAuthState({
            isLoggedIn: true,
            currentUser: coveyUser
        });
        
        return coveyUser;
    }

    async registerUserEmailPassword(credential: EmailPasswordCredential): Promise<void> {
        await this._realmApp.registerUserEmailPassword(credential);
    }
    
    getCurrentUser(): CoveyUser | null {
        const realmUser = this._realmApp.CurrentUser;
        if(!realmUser) {
            return null;
        }
        const coveyUser: CoveyUser = {
            id: realmUser.id,
            isLoggedIn: realmUser.isLoggedIn,
            profile: {
                user_id: realmUser.customData.user_id,
                userName: realmUser.customData.userName,
                email: realmUser.customData.email,
                pfpURL: realmUser.customData.pfpURL,
                bio: realmUser.customData.bio,
            },
            actions: {
                logout: realmUser.logOut
            }

        }
        return coveyUser;
    }

    async loginWithGoogle(setAuthState: React.Dispatch<React.SetStateAction<AuthState>>) : Promise<void> {
        console.log('test');
    }
}