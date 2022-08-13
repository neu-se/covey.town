import CORS from 'cors';
import Express from 'express';
import http from 'http';
import { AddressInfo } from 'net';
import addTownRoutes from '../router/towns';
import TownsServiceClient from './TownsServiceClient';
import * as prismaFunctions from './prismaFunctions';
import * as requestHandlers from '../requestHandlers/CoveyTownRequestHandlers';

describe('TownsServiceAPIREST', () => {
  let server: http.Server;
  let apiClient: TownsServiceClient;

  beforeAll(async () => {
    const app = Express();
    app.use(CORS());
    server = http.createServer(app);

    addTownRoutes(server, app);
    await server.listen();
    const address = server.address() as AddressInfo;

    apiClient = new TownsServiceClient(`http://127.0.0.1:${address.port}`);

    const user = {
      id: 243790057,
      user_name: 'tom',
      email: 'vitor@vitor.io',
      hash_password: 'afdjfkhanf[owh',
      banned: false,
      is_admin: false,
      previous_town: 0,
    };
    jest.spyOn(prismaFunctions, 'createUser').mockResolvedValue(user);
    
  });

  afterAll(async () => {
    await server.close();
  });

  describe('Sign Up REST API test', () => {
    it('should successfully sign up the user', async () => {
      try {
        await apiClient.signUp({
          userName: 'frank',
          email: 'frank@example.com',
          password: '123456abc',
        });
      } catch (err) {
        fail('Expected successfully signup a user');
      }
    });
    it('should throw an error with empty username', async () => {
      try {
        await apiClient.signUp({
          userName: '',
          email: 'frank@example.com',
          password: '123456',
        });
        fail('Should throw an error');
      } catch (err) {
        if (err instanceof Error) {
          expect(err.message).toBe('Request failed with status code 500');
        }
      }
    });
    it('should throw an error with empty password', async () => {
      try {
        await apiClient.signUp({
          userName: 'frank',
          email: 'frank@example.com',
          password: '',
        });
        fail('Should throw an error');
      } catch (err) {
        if (err instanceof Error) {
          expect(err.message).toBe('Request failed with status code 500');
        }
      }
    });
    it('should throw an error with empty email', async () => {
      try {
        await apiClient.signUp({
          userName: 'Frank',
          email: '',
          password: '123456',
        });
        fail('Should throw an error');
      } catch (err) {
        if (err instanceof Error) {
          expect(err.message).toBe('Request failed with status code 500');
        }
      }
    });
    it('should valid information receive', async () => {
      const spySignUpHandler = jest.spyOn(requestHandlers, 'authSignupHandler');
      try {
        await apiClient.signUp({
          userName: 'frank',
          email: 'frank@example.com',
          password: '123456abc',
        });
      } catch (err) {
        fail('Expected successfully signup a user');
      }
      expect(spySignUpHandler).toBeCalledWith({
        userName: 'frank',
        email: 'frank@example.com',
        password: '123456abc',
      });
    });
  });
});
