import { Request, Response } from 'express';
import User from '../client/userAccountSchema';
import { IUserAccount } from '../types/UserAccount';

const getAllUsers = async (_: Request, res: Response): Promise<void> => {
  try {
    const users: IUserAccount[] = await User.find({});
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).send('Internal Error');
  }
};

const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userID = req.params.id;
    const user: IUserAccount | null = await User.findById(userID);
    if (!user) {
      res.status(404).json({ user: null, message: 'Could not find user with that id' });
    } 
    res.status(200).json({
      user: {
        userID: user?._id,
        username: user?.username,
        avatar: user?.avatar,
      },
    });
  } catch (error) {
    res.status(500).send('Internal Error');
  }
};

const findUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user: IUserAccount | null = await User.findOne({
      username: req.body.username,
      password: req.body.password,
    });
    if (!user) {
      res.status(200).json({ user: null, message: 'Could not find user with that combination' });
    }

    if (user) {
      res.status(200).json({
        user: {
          userID: user._id,
          username: user.username,
          avatar: user.avatar,
        },
      });
    }
  } catch (error) {
    res.status(500).send('Internal Error');
  }
};

const addUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userNameExists : IUserAccount | null = await User.findOne({
      username: req.body.username,
    });

    if (userNameExists) {
      res
        .status(406)
        .json({message: 'Username already exists'});
    }

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
    res.status(500).send('Internal Error');
  }
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userID = req.params.id;

    const updatedUser: IUserAccount | null = await User
      .findByIdAndUpdate(
        userID,
        {
          username: req.body.username,
          avatar: req.body.avatar,
        },
        {new: true},
      );

    const allUsers: IUserAccount[] = await User.find({});
    res.status(200).json({
      message: 'User updated',
      user: {
        userID: updatedUser?._id,
        username: updatedUser?.username,
        password: updatedUser?. password,
        avatar: updatedUser?.avatar,
      },
      accounts: allUsers,
    });
  } catch (error) {
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
    res.status(500).send('Internal Error');
  }
};

export { getAllUsers, getUser, addUser, updateUser, deleteUser, findUser };
