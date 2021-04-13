import { Request, Response } from 'express';
import User from '../client/userAccountSchema';
import { IUserAccount } from '../types/UserAccount';

const getUsers = async (_: Request, res: Response): Promise<void> => {
  try {
    const users: IUserAccount[] = await User.find({});
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Error');
  }
};

const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user: IUserAccount | null = await User.findOne({
      username: req.body.username,
      password: req.body.password,
    });
    if (!user) {
      res.status(200).json({ user: null, message: 'Could not find user with that combination' });
    } else if (req.body.avatar) {
      user.avatar = req.body.avatar;
      await user?.save();
    }
    res.status(200).json({
      user: {
        userID: user?._id,
        username: user?.username,
        avatar: user?.avatar,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Error');
  }
};

const addUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const account: IUserAccount = new User({
      username: req.body.username,
      password: req.body.password,
    });
    const newAccount: IUserAccount = await account.save();
    const allAccounts: IUserAccount[] = await User.find({});

    res
      .status(201)
      .json({ message: 'userAccount added', account: newAccount, accounts: allAccounts });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Error');
  }
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      params: { id },
      body,
    } = req;

    const updateUsers: IUserAccount | null = await User.findByIdAndUpdate({ _id: id }, body);

    const allUsers: IUserAccount[] = await User.find({});
    res.status(200).json({
      message: 'User updated',
      account: updateUsers,
      accounts: allUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Error');
  }
};

const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedUser: IUserAccount | null = await User.findByIdAndRemove(req.params.id);

    const allUsers: IUserAccount[] = await User.find({});
    res.status(200).json({
      message: 'user deleted',
      account: deletedUser,
      accounts: allUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Error');
  }
};

export { getUsers, getUser, addUser as addUsers, updateUser as updateUsers, deleteUser };
