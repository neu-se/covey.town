export interface IUserAccountAuthStatus extends IUserAccountLogin {
  isLoggedIn: boolean;
}
export interface IUserAccount {
  username: string;
  password: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUserAccountLogin extends IUserAccount {
  avatar: string;
}

export interface UserAccountProps {
  accounts: IUserAccount;
}

export interface IApiResponseWithMessage {
  message?: string;
}

export interface IApiLoginDataType extends IApiResponseWithMessage {
  user: IUserAccountLogin | null;
}

export interface IApiRegisterDataType extends IApiResponseWithMessage {
  user: IUserAccount | null;
}

export type ApiDataType = {
  message: string;
  status: string;
  todos: IUserAccount[];
  todo?: IUserAccount;
};

export type UserProfileContextType = {
  userProfile: IUserAccountAuthStatus | null;
  setUserProfile: React.Dispatch<React.SetStateAction<IUserAccountAuthStatus | null>>;
};
