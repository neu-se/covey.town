import { Express } from 'express';
import BodyParser from 'body-parser';
import io from 'socket.io';
import { Server } from 'http';
import {
  roomJoinHandler,
  roomSubscriptionHandler,
} from '../requestHandlers/CoveyRoomRequestHandlers';

export default function addRoomRoutes(http: Server, app: Express): void {
  app.post('/room/:roomID', BodyParser.json(), async (req, res) => {
    try {
      const result = await roomJoinHandler({
        userName: req.body.userName,
        coveyRoomID: req.params.roomID,
      });
      res.status(200).json(result);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.trace(err);
      res.status(500).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  const socketServer = new io.Server(http, { cors: { origin: '*' } });
  socketServer.on('connection', roomSubscriptionHandler);
}
