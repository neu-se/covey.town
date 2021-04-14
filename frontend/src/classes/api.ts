import axios, { AxiosResponse } from 'axios';
import {
  ApiDataType,
  IApiLoginDataType,
  IApiRegisterDataType,
  IUserAccount,
  IUserAccountLogin,
} from './UserAccount';

const baseUrl = 'http://localhost:4000';

export const getAllUsers = async (): Promise<AxiosResponse<ApiDataType>> => {
  try {
    const users: AxiosResponse<ApiDataType> = await axios.get(`${baseUrl}/accounts`);
    return users;
  } catch (error) {
    throw new Error(error);
  }
};

export const getUser = async (userId: string): Promise<AxiosResponse<IApiLoginDataType>> => {
  try {
    const response: AxiosResponse<IApiLoginDataType> = await axios.get(`${baseUrl}/accounts/${userId}`);
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const findUser = async ({
  username,
  password
}: IUserAccount): Promise<AxiosResponse<IApiLoginDataType>> => {
  try {
    const response: AxiosResponse<IApiLoginDataType> = await axios.post(`${baseUrl}/accounts/login`, {
      username,
      password
    });
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const addUser = async ({
  username,
  password
}: IUserAccount): Promise<AxiosResponse<IApiRegisterDataType>> => {
  try {
    const saveAccount: AxiosResponse<IApiRegisterDataType> = await axios.post(`${baseUrl}/accounts`, {
      username,
      password
    });
    return saveAccount;
  } catch (error) {
    throw new Error(error);
  }
};

export const updateUser = async ({
  username,
  avatar
}: IUserAccountLogin,
  userId: string): Promise<AxiosResponse<IApiLoginDataType>> => {
  try {
    const updatedUser: AxiosResponse<IApiLoginDataType> = await axios.put(
      `${baseUrl}/accounts/${userId}`,{
        username,
        avatar
      });
    return updatedUser;
  } catch (error) {
    throw new Error(error);
  }
};

export const deleteUser = async (_id: string): Promise<AxiosResponse<IApiLoginDataType>> => {
  try {
    const deletedUser: AxiosResponse<IApiLoginDataType> = await axios.delete(
      `${baseUrl}/accounts/${_id}`,
    );
    return deletedUser;
  } catch (error) {
    throw new Error(error);
  }
};
