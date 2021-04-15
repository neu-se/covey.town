import BodyParser from 'body-parser';
import { Express } from 'express';
import { Server } from 'http';
import { StatusCodes } from 'http-status-codes';
import io from 'socket.io';
import { saveUserHandler, getUserHandler, SaveUserRequest } from '../requestHandlers/AccountRequestHandlers';

export default function addAccountRoutes(http: Server, app: Express): io.Server {
  /*
   * Create or update a user for Covey.Town
   */
  app.put('/user', BodyParser.json(), async (req, res) => {
    try {
      const result = await saveUserHandler(req.body as SaveUserRequest);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see account server for more details'
      });
    }
  });

  /**
   * Get a user's setting preferences from Covey.Town
   */
  app.get('/user/:userID', BodyParser.json(), async (req, res) => {
    try {
      const result = await getUserHandler({
        userID: req.params.userID,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see account server for more details',
      });
    }
  });

  const socketServer = new io.Server(http, { cors: { origin: '*' } });
  return socketServer;
}
