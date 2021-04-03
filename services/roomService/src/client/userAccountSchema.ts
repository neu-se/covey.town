import {model, Schema} from "mongoose"
import { IUserAccount } from "../types/UserAccount"

const userAccountSchema: Schema = new Schema(
    {
      username: {
        type: String,
        required: true,
      },
      password: {
        type: String, 
        required: true,
      },
      avatar: {
        type: String,
        required: false,
      },
    },
  )
  
  export default model<IUserAccount>("UserAccountItem", userAccountSchema)