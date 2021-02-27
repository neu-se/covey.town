import { Express } from 'express';
import BodyParser from 'body-parser';
import io from 'socket.io';
import { Server } from 'http';
import { StatusCodes } from 'http-status-codes';
import {
  roomCreateHandler, roomDeleteHandler,
  roomJoinHandler,
  roomListHandler,
  roomSubscriptionHandler,
  roomUpdateHandler,
} from '../requestHandlers/CoveyRoomRequestHandlers';
import { logError } from '../Utils';

export default function addRoomRoutes(http: Server, app: Express): void {
  /*
   * Create a new session (aka join a room)
   */
  app.post('/sessions', BodyParser.json(), async (req, res) => {
    try {
      const result = await roomJoinHandler({
        userName: req.body.userName,
        coveyRoomID: req.body.coveyRoomID,
      });
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

  /**
   * Delete a room
   */
  app.delete('/towns/:roomID/:roomPassword', BodyParser.json(), async (req, res) => {
    try {
      const result = await roomDeleteHandler({
        coveyRoomID: req.params.roomID,
        coveyRoomPassword: req.params.roomPassword,
      });
      res.status(200)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(500)
        .json({
          message: 'Internal server error, please see log in server for details',
        });
    }
  });

  /**
   * List all rooms
   */
  app.get('/towns', BodyParser.json(), async (_req, res) => {
    try {
      const result = await roomListHandler();
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

  /**
   * Create a room
   */
  app.post('/towns', BodyParser.json(), async (req, res) => {
    try {
      const result = await roomCreateHandler(req.body);
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
  /**
   * Update a room
   */
  app.patch('/towns/:roomID', BodyParser.json(), async (req, res) => {
    try {
      const result = await roomUpdateHandler({
        coveyRoomID: req.params.roomID,
        isPubliclyListed: req.body.isPubliclyListed,
        friendlyName: req.body.friendlyName,
        coveyRoomPassword: req.body.coveyRoomPassword,
      });
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
  socketServer.on('connection', roomSubscriptionHandler);
}
