/* eslint-disable class-methods-use-this */
import { User } from "realm-web";
import { AuthState, EmailPasswordCredential } from "../../CoveyTypes";
import RealmApp from "../../database/RealmApp";
import IAuth from "./IAuth";
import IDBClient from "../../database/IDBClient";
import RealmDBClient from "../../database/RealmDBClient";

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

    async loginWithEmailPassword(credential: EmailPasswordCredential, setAuthState: React.Dispatch<React.SetStateAction<AuthState>>): Promise<User> {

        const user = await this._realmApp.loginWithEmailPassword(credential, setAuthState);
        const userProfile = await this._realmDBClient.searchUserProfileById(user.id);
        if(!userProfile) {
            await this._realmDBClient.saveUserProfile({
                id: user.id,
                email: credential.email
            })
        }
        return user;
    }

    async registerUserEmailPassword(credential: EmailPasswordCredential): Promise<void> {
        await this._realmApp.registerUserEmailPassword(credential);
    }
    
    getCurrentUser(): Realm.User | null {
        return this._realmApp.CurrentUser;
    }
}