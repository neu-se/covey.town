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

export type ApiAuthDataType = {
  message?: string;
  user: IUserAccount | IUserAccountLogin | null;
};

export type ApiDataType = {
  message: string;
  status: string;
  todos: IUserAccount[];
  todo?: IUserAccount;
};
