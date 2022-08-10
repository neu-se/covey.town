import { createUser, updateUser, deleteUser } from './prismaFunctions';
import prismaMock from './singleton';

it('should create new user ', async () => {
  const user = {
    id: 243790057,
    user_name: 'Vitor',
    email: 'vitor@vitor.io',
    hash_password: 'afdjfkhanf[owh',
    banned: false,
    is_admin: false,
    previous_town: 0,
  };

  prismaMock.user.create.mockResolvedValue(user);

  await expect(createUser(user)).resolves.toEqual({
    id: 243790057,
    user_name: 'Vitor',
    email: 'vitor@vitor.io',
    hash_password: 'afdjfkhanf[owh',
    banned: false,
    is_admin: false,
    previous_town: 0,
  });
});

it('should update a users name ', async () => {
  const user = {
    id: 243790057,
    user_name: 'Victor',
    email: 'victor@victor.io',
    hash_password: 'afdjfkhanf[owh',
    banned: false,
    is_admin: false,
    previous_town: 0,
  };

  prismaMock.user.update.mockResolvedValue(user);

  await expect(updateUser(user)).resolves.toEqual({
    id: 243790057,
    user_name: 'Victor',
    email: 'victor@victor.io',
    hash_password: 'afdjfkhanf[owh',
    banned: false,
    is_admin: false,
    previous_town: 0,
  });
});

it('should fail if user exists', async () => {
  const user = {
    id: 243790056,
    user_name: 'Victor',
    email: 'victor.@victor.io',
    hash_password: 'afdjfkhanf[owh',
    banned: false,
    is_admin: false,
    previous_town: 0,
  };

  prismaMock.user.create.mockRejectedValue(new Error('User already exists!'));

  await expect(createUser(user)).rejects.toEqual(new Error('User already exists!'));
});

it('should delete a user', async () => {
  const user = {
    id: 243790057,
    user_name: 'Victor',
    email: 'victor@victor.io',
    hash_password: 'afdjfkhanf[owh',
    banned: false,
    is_admin: false,
    previous_town: 0,
  };

  prismaMock.user.delete.mockResolvedValue(user);
  await expect(deleteUser(user)).resolves.toEqual({
    id: 243790057,
    user_name: 'Victor',
    email: 'victor@victor.io',
    hash_password: 'afdjfkhanf[owh',
    banned: false,
    is_admin: false,
    previous_town: 0,
  });
});
