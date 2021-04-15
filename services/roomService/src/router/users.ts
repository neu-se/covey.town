import { Express } from 'express';
import { addUser, deleteUser, getUser, getAllUsers, findUser, updateUser } from './UserAccountIndex';

const users = (app: Express): void => {
  app.get('/accounts', getAllUsers);

  app.get('/accounts/:id', getUser);

  app.post('/accounts/login', findUser);

  app.post('/accounts', addUser);

  app.put('/accounts/:id', updateUser);

  app.delete('/accounts/:id', deleteUser);
};

export default users;
