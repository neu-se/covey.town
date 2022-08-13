import prisma from './prismaClient';

export interface CreateUser {
  email: string;
  user_name: string;
  hash_password: string;
  previous_town: number;
  banned: boolean;
  is_admin: boolean;
}

export async function createUser(user: CreateUser): Promise<CreateUser> {
  try {
    const result = await prisma.user.create({
      data: user,
    });
    return result;
  } catch (err) {
    throw new Error('User already exists!');
  }
}

interface UpdateUser {
  id: number;
  user_name: string;
  email: string;
}

export async function updateUser(user: UpdateUser): Promise<UpdateUser> {
  const result = await prisma.user.update({
    where: { id: user.id },
    data: user,
  });
  return result;
}

interface DeleteUser {
  email: string;
}

export async function deleteUser(user: DeleteUser): Promise<DeleteUser> {
  const result = await prisma.user.delete({
    where: { email: user.email },
  });
  return result;
}

interface FindUser {
  email: string;
  password?: string;
}

interface FindUserResult {
  user_name: string;
  hash_password: string;
}

export async function findUser(user: FindUser): Promise<FindUserResult> {
  const result = await prisma.user.findUnique({
    where: { email: user.email },
    select: {
      user_name: true,
      hash_password: true,
    },
  });
  if (result) {
    return result;
  } 
  throw new Error('User not found!');
}
