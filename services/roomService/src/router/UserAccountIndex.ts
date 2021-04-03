import { Response, Request } from "express"
import { IUserAccount } from '../types/UserAccount';
import userAccountSchema from "../client/userAccountSchema";


const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const users: IUserAccount[] = await userAccountSchema.find()
        res.status(200).json({users})
    } catch (error) {
        throw error
    }
}


const addUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body as Pick<IUserAccount, "username" | "password">

        const account: IUserAccount = new userAccountSchema({
            username: body.username,
            password: body.password,
        })
        const newAccount: IUserAccount = await account.save()
        const allAccounts: IUserAccount[] = await userAccountSchema.find()
    
        res.status(201).json({message: "userAccount added", account: newAccount, accounts: allAccounts})
        console.log("body.username");
    } catch (error) {
        throw error
    }   
}

const updateUser = async (req: Request, res: Response): Promise <void> => {
    try {
        const {
            params: { id },
            body,
        } = req

        const updateUsers: IUserAccount | null = await userAccountSchema.findByIdAndUpdate(
            { _id: id },
            body
        )

        const allUsers: IUserAccount[] = await userAccountSchema.find()
        res.status(200).json({
            message: "User updated",
            account: updateUsers,
            accounts: allUsers,
        })
    } catch (error) {
        throw error
    }
}

const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedUser: IUserAccount | null = await userAccountSchema.findByIdAndRemove(
            req.params.id
        )

        const allUsers: IUserAccount[] = await userAccountSchema.find()
        res.status(200).json({
            message: "user deleted",
            account: deletedUser,
            accounts: allUsers
        })

    } catch (error) {
        throw error
    }
}

export {getUser as getUsers, addUser as addUsers, updateUser as updateUsers, deleteUser}