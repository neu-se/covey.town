import { EmailPasswordCredential } from "../CoveyTypes";

export default interface IRealmClient {
    loginWithEmailPassword(credential: EmailPasswordCredential, setAuthState: any): Promise<Realm.User>;

    getCurrentUser(): Realm.User | null;
}