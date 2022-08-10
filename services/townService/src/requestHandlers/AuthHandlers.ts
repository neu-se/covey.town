import assert from 'assert';
import { Socket } from 'socket.io';
import Player from '../types/Player';
import prisma from '../client/prismaClient';
import { hashPassword } from '../Utils';
import { createUser } from '../client/prismaFunctions';

export async function authSignupHandler(
  userName: string,
  password: string,
  email: string,
): Promise<{ userName: string }> {
  const hashedPassword = await hashPassword(password);
  assert(userName, 'userName is required');
  assert(password, 'password is required');
  createUser({
    email,
    user_name: userName,
    hash_password: hashedPassword,
    previous_town: 0,
    banned: false,
    is_admin: false,
  })
    .then(() => {
      console.log('User created');
      return { userName };
    })
    .catch(err => {
      console.log(err);
      throw new Error('User already exists!');
    });
}
