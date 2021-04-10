import { Server } from 'http';
import io from 'socket.io';
import userSubscriptionHandler from '../requestHandlers/CoveyUserRequestHandlers';

export default function addUserRoutes(http: Server): io.Server {
  const socketServer = new io.Server(http, { cors: { origin: '*' } });
  socketServer.on('connection', userSubscriptionHandler);
  return socketServer;
}