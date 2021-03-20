import * as Realm from "realm-web";
import assert from 'assert';
import dotenv from 'dotenv';
import { EmailPasswordCredential } from '../CoveyTypes';

export default class RealmClient {
    private static realmID = process.env.REACT_APP_REALM_ID;

    private static getId() {
        assert(RealmClient.realmID);
        return RealmClient.realmID;
    }

    private static realmId : string = RealmClient.getId();



    private static Application: Realm.App = new Realm.App({ id: RealmClient.getId() });



    static async loginWithEmailPassword(credential: EmailPasswordCredential, setAuthState: any): Promise<Realm.User> {
        const credentials = Realm.Credentials.emailPassword(
            credential.email,
            credential.password
        );

        const user = await RealmClient.Application.logIn(credentials);
        setAuthState({
            isLoggedIn: true,
            currentuser: user
        })
        console.log("Successfully logged in!", user.id);
        return user;

    }

    static async registerUserEmailPassword(credential: EmailPasswordCredential): Promise<void> {
        await RealmClient.Application.emailPasswordAuth.registerUser(credential.email, credential.password);
    }

    static getCurrentUser(): Realm.User | null  {
        return RealmClient.Application.currentUser;
    }
}