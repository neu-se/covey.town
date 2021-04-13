import { Document } from "mongoose"

export interface IUserAccount extends Document {
  username: string
  password: string
  avatar: string
}

