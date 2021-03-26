import * as Realm from "realm-web";
import assert from 'assert';
import { setContext } from '@apollo/client/link/context';
import { ApolloClient, HttpLink, InMemoryCache, NormalizedCacheObject } from "@apollo/client";
import { AuthState, CoveyUserProfile, EmailPasswordCredential, UserProfile } from '../../CoveyTypes';

/**
 * Singleton Realm App class to construct a realm app service and authorize a user client.
 */
export default class RealmApp {

    private static _instance: RealmApp;

    private _app: Realm.App;

    private _realmId: string | undefined;

    private _appolloClient: ApolloClient<NormalizedCacheObject>;

    private _httpLink: HttpLink;

    private _apolloLink;

    private constructor() {
        this._realmId = process.env.REACT_APP_REALM_ID;
        this._httpLink = new HttpLink({ uri: `https://realm.mongodb.com/api/client/v2.0/app/${this.AppId}/graphql` });
        this._apolloLink = setContext(async (_, { headers }) => {
            // get the authentication token from local storage if it exists
            const accessToken = await this.getValidAccessToken();

            // return the headers to the context so httpLink can read them
            return {
                headers: {
                    ...headers,
                    authorization: accessToken ? `Bearer ${accessToken}` : "",
                }
            }
        });
        this._app = new Realm.App({ id: this.AppId });

        this._appolloClient = new ApolloClient({
            link: this._apolloLink.concat(this._httpLink),
            cache: new InMemoryCache()
        })
    }

    static getInstance(): RealmApp {
        if (RealmApp._instance === undefined) {
            RealmApp._instance = new RealmApp();
          }
          return RealmApp._instance;
    }

    private get AppId() {
        assert(this._realmId);
        return this._realmId;
    }

    get ApolloClient(): ApolloClient<NormalizedCacheObject> {
        return this._appolloClient;
    }

    private async getValidAccessToken() {
        if (!this._app.currentUser) {
            throw new Error('Cannot get valid access token from no user');
        }
        await this._app.currentUser.refreshCustomData();
        return this._app.currentUser.accessToken;
    }

    async loginWithEmailPassword(credential: EmailPasswordCredential): Promise<Realm.User> {
        const credentials = Realm.Credentials.emailPassword(
            credential.email,
            credential.password
        );

        const realmUser = await this._app.logIn(credentials);
        
        return realmUser;
    }

    async registerUserEmailPassword(credential: EmailPasswordCredential): Promise<void> {
        await this._app.emailPasswordAuth.registerUser(credential.email, credential.password);
    }

    get CurrentUser(): Realm.User | null {
        return this._app.currentUser;
    }

    async loginWithGoogle(): Promise<Realm.User> {
        const RedirectUri = "http://localhost:3000"
        const credentials = Realm.Credentials.google(RedirectUri);
    
        const realmUser = await this._app.logIn(credentials);
        return realmUser;
    }

    async sendPasswordResetEmail(email: string): Promise<void> {
        this._app.emailPasswordAuth.sendResetPasswordEmail(email);
    }
    
}