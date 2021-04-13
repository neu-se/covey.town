import { Express } from 'express';
import { addUsers, deleteUser, getUser, getUsers, updateUsers } from './UserAccountIndex';

const users = (app: Express): void => {
  app.get('/accounts', getUsers);

  app.post('/account', getUser);

  app.post('/add-user', addUsers);

  app.put('/edit-user/:id', updateUsers);

  app.delete('/delete-user/:id', deleteUser);
};

export default users;
