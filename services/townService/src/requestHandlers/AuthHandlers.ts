import assert from 'assert';
import { Socket } from 'socket.io';
import Player from '../types/Player';
import prisma from '../client/prismaClient';

export async function authSignupHandler(
  userName: string,
  password: string,
): Promise<{ userName: string }> {
  assert(userName, 'userName is required');
  assert(password, 'password is required');
  return {
    userName,
  };
}
