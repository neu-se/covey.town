/* eslint-disable class-methods-use-this */
import axios from "axios";
import { AuthState, CoveyUser, EmailPasswordCredential, GoogleAuthInfo, GoogleUserInfo } from "../../CoveyTypes";
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
            await this._realmDBClient.saveUser(starterCoveyUser);
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
        await this._realmDBClient.saveUser(coveyUser);
        return coveyUser;
    }

    async registerUserEmailPassword(credential: EmailPasswordCredential): Promise<void> {
        await this._realmApp.registerUserEmailPassword(credential);
    }

    async getCurrentUser(): Promise<CoveyUser | null> {
        return null;
    }

    async loginWithGoogle(googleAuthInfo: GoogleAuthInfo, setAuthState: React.Dispatch<React.SetStateAction<AuthState>>): Promise<CoveyUser> {
        const { idToken } = googleAuthInfo;
        const realmUser = await this._realmApp.loginWithGoogle(idToken);
        const dbCoveyUser = await this._realmDBClient.getUser(realmUser.id);
        if(!dbCoveyUser) {
            const axiosClient = axios.create();
            const userInfo: GoogleUserInfo = (await axiosClient.get('https://openidconnect.googleapis.com/v1/userinfo',{headers:{'Authorization':`Bearer ${googleAuthInfo.token}`}})).data;
            
            const starterCoveyUser: CoveyUser = {
                userID: realmUser.id,
                isLoggedIn: realmUser.isLoggedIn,
                profile: {
                    username: userInfo.name,
                    email: userInfo.email,
                    pfpURL: userInfo.picture
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
            await this._realmDBClient.saveUser(starterCoveyUser);
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
        await this._realmDBClient.saveUser(coveyUser);
        return coveyUser;
    }
    
    async sendPasswordResetEmail(email: string): Promise<void> {
        this._realmApp.sendPasswordResetEmail(email);
    }
}