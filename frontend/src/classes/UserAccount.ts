
export interface IUserAccount  {
  username: string
  password: string
  createdAt?: string
  updatedAt?: string
}

export interface UserAccountProps {
  accounts: IUserAccount
}

export type ApiDataType = {
  message: string
  status: string
  todos: IUserAccount[]
  todo?: IUserAccount
}