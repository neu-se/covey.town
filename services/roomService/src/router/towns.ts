import BodyParser from 'body-parser';
import { Express } from 'express';
import { Server } from 'http';
import { StatusCodes } from 'http-status-codes';
import io from 'socket.io';
import {
  accountCreateHandler,
  loginHandler,
  searchUsersByUsername,
  sendAddNeighborRequest,
  townCreateHandler,
  townDeleteHandler,
  townJoinHandler,
  townListHandler,
  townSubscriptionHandler,
  townUpdateHandler,
} from '../requestHandlers/CoveyTownRequestHandlers';
import { logError } from '../Utils';

export default function addTownRoutes(http: Server, app: Express): io.Server {
  /*
   * Create a new session (aka join a town)
   */
  app.post('/sessions', BodyParser.json(), async (req, res) => {
    try {
      const result = await townJoinHandler({
        userName: req.body.userName,
        coveyTownID: req.body.coveyTownID,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Delete a town
   */
  app.delete('/towns/:townID/:townPassword', BodyParser.json(), async (req, res) => {
    try {
      const result = await townDeleteHandler({
        coveyTownID: req.params.townID,
        coveyTownPassword: req.params.townPassword,
      });
      res.status(200).json(result);
    } catch (err) {
      logError(err);
      res.status(500).json({
        message: 'Internal server error, please see log in server for details',
      });
    }
  });

  /**
   * List all towns
   */
  app.get('/towns', BodyParser.json(), async (_req, res) => {
    try {
      const result = await townListHandler();
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Create a town
   */
  app.post('/towns', BodyParser.json(), async (req, res) => {
    try {
      const result = await townCreateHandler(req.body);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });
  /**
   * Update a town
   */
  app.patch('/towns/:townID', BodyParser.json(), async (req, res) => {
    try {
      const result = await townUpdateHandler({
        coveyTownID: req.params.townID,
        isPubliclyListed: req.body.isPubliclyListed,
        friendlyName: req.body.friendlyName,
        coveyTownPassword: req.body.coveyTownPassword,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Create an account
   */
  app.post('/signup', BodyParser.json(), async (req, res) => {
    try {
      console.log(req.body);
      const result = await accountCreateHandler(req.body);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Login to an existing account to get id
   */
  app.post('/login', BodyParser.json(), async (req, res) => {
    try {
      console.log(req.body);
      const result = await loginHandler(req.body);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Search for an account with the passed username
   */
  app.get('/users/:username', BodyParser.json(), async (req, res) => {
    try {
      const result = await searchUsersByUsername({
        currentUserId: req.params.currentUserId,
        username: req.params.username,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /*
   * Send neighbor request
   */
  app.get('/users/request_neighbor', BodyParser.json(), async (req, res) => {
    try {
      const result = await sendAddNeighborRequest(req.body);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  const socketServer = new io.Server(http, { cors: { origin: '*' } });
  socketServer.on('connection', townSubscriptionHandler);
  return socketServer;
}
