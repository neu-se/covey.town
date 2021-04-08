import { Express } from 'express';
import BodyParser from 'body-parser';
import io from 'socket.io';
import { Server } from 'http';
import { StatusCodes } from 'http-status-codes';
import { userExistsHandler, getFriendsHandler, addFriendHandler, getStatusHandler, setStatusHandler, addUserHandler } from '../requestHandlers/DBRequestHandlers';
import { logError } from '../../../roomService/src/Utils';

export default function addDBRoutes(http: Server, app: Express):io.Server {

  app.get('/users?email=emailID', BodyParser.json(), async (req, res) => {
    try {
      const result = userExistsHandler({email: req.params.email});
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  app.get('/users/:emailID/friends', BodyParser.json(), async (req, res) => {
    try {
      const result = getFriendsHandler({email: req.params.emailID});
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  app.get('/users/:emailID/status', BodyParser.json(), async (req, res) => {
    try {
      const result = getStatusHandler({email: req.params.emailID});
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  app.post('/users/:emailID/status/', BodyParser.json(), async (req, res) => {
    try {
      const result = await setStatusHandler(req.body.status);
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  app.post('/users', BodyParser.json(), async (req, res) => {
    try {
      const result = await addUserHandler(req.body.status);
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  app.post('/users/:emailID/friends/:friendEmailID ', BodyParser.json(), async (req, res) => {
    try {
      const result = await addFriendHandler({email: req.params.emailID, friendEmail: req.params.friendEmailID});
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  const socketServer = new io.Server(http, { cors: { origin: '*' } });
  return socketServer;
}