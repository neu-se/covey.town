import express, { Express } from 'express';
import io from 'socket.io';
import { Server } from 'http';
import { StatusCodes } from 'http-status-codes';
import { authSignupHandler } from '../requestHandlers/AuthHandlers';

export default function addAuthRoutes(http: Server, app: Express): io.Server {
  // Creates a new user
  app.post('/signup', express.json(), async (req, res) => {
    try {
      const result = await authSignupHandler(req.body.userName, req.body.password, req.body.email);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });
}
