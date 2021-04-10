export default class CoveyTownsUser {
  private static _instance: CoveyTownsUser;

  private _userEmail: string;

  private _userName: string;

  private _userStatus!: boolean;

  constructor() {
    this._userEmail = "";
    this._userName = "";
  }

  static getInstance(): CoveyTownsUser {
    if (CoveyTownsUser._instance === undefined) {
      CoveyTownsUser._instance = new CoveyTownsUser();
    }
    return CoveyTownsUser._instance;
  }

  setUserEmail(email: string): void {
    this._userEmail = email;
  }

  getUserEmail(): string {
    return this._userEmail;
  }

  setUserName(name: string): void {
    this._userName = name;
  }

  getUserName(): string {
    return this._userName;
  }

  setUserStatus(status: boolean): void {
    this._userStatus = status;
  }

  getUserStatus(): boolean {
    return this._userStatus;
  }
}