import * as Realm from "realm-web";
import IRealmClient from "./IRealmClient";
import { EmailPasswordCredential } from '../CoveyTypes';

export default class InitRealm implements IRealmClient {
    private _application: Realm.App;

    constructor() {
        this._application = new Realm.App({ id: "coveytown1-msmxv" });
    }


    async loginWithEmailPassword(credential: EmailPasswordCredential, setAuthState: any): Promise<Realm.User> {
        const credentials = Realm.Credentials.emailPassword(
            credential.email,
            credential.password
        );

        const user = await this._application.logIn(credentials);
        console.log("Successfully logged in!", user.id);
        return user;

    }

    getCurrentUser(): Realm.User | null {
        return this._application.currentUser;
    }
}