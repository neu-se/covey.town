/* eslint-disable class-methods-use-this */
import { AuthState, CoveyUser, EmailPasswordCredential } from "../../CoveyTypes";
import RealmApp from "../database/RealmApp";
import IAuth from "./IAuth";
import IDBClient from "../database/IDBClient";
import RealmDBClient from "../database/RealmDBClient";

/**
 * Realm authentication provider class 
 */
export default class RealmAuth implements IAuth {

    /** singleton instance */
    private static _instance: RealmAuth;

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
        const dbCoveyUser = await this._realmDBClient.getUser(realmUser.id);
        if(!dbCoveyUser) {
            const starterCoveyUser: CoveyUser = {
                userID: realmUser.id,
                isLoggedIn: realmUser.isLoggedIn,
                profile: {
                    username: '',
                    email: credential.email
                },
                friendIDs: [],
                actions: {
                    logout: async () => {
                        await realmUser.logOut();
                    }
                }
            }
            setAuthState({
                currentUser: starterCoveyUser
            });
            return starterCoveyUser;
        }
        const coveyUser: CoveyUser = {
            userID: realmUser.id,
            isLoggedIn: realmUser.isLoggedIn,
            profile: dbCoveyUser.profile,
            currentTown: dbCoveyUser.currentTown,
            friendIDs: dbCoveyUser.friendIDs,
            actions: {
                logout: async () => {
                    await realmUser.logOut();
                }
            }
        }

        setAuthState({
            currentUser: coveyUser
        });

        return coveyUser;
    }

    async registerUserEmailPassword(credential: EmailPasswordCredential): Promise<void> {
        await this._realmApp.registerUserEmailPassword(credential);
    }

    async getCurrentUser(): Promise<CoveyUser | null> {
        // const realmUser = this._realmApp.CurrentUser;
        // console.log(realmUser);
        // if (!realmUser) {
        //     return null;
        // }
        // const dbCoveyUser = await this._realmDBClient.getUser(realmUser.id);
        // const coveyUser: CoveyUser = {
        //     userId: realmUser.id,
        //     isLoggedIn: dbCoveyUser.isLoggedIn,
        //     profile: dbCoveyUser.profile,
        //     currentTown: dbCoveyUser.currentTown,
        //     actions: {
        //         logout: async () => {
        //             await realmUser.logOut();
        //         }
        //     }

        // }
        // return coveyUser;
        return null;
    }

    async loginWithGoogle(setAuthState: React.Dispatch<React.SetStateAction<AuthState>>): Promise<void> {
        const realmUser = await this._realmApp.loginWithGoogle();

        const coveyUser: CoveyUser = {
            userID: realmUser.id,
            isLoggedIn: realmUser.isLoggedIn,
            profile: {
                username: realmUser.customData.user_name,
                email: realmUser.customData.email,
                pfpURL: realmUser.customData.pfpURL,
                bio: realmUser.customData.bio,
            },
            friendIDs: [],
            actions: {
                logout: async () => {
                    await realmUser.logOut();
                }
            }
        }

        setAuthState({
            currentUser: coveyUser
        });

    }

    async sendPasswordResetEmail(email: string): Promise<void> {
        this._realmApp.sendPasswordResetEmail(email);
    }
}