import * as http from 'http';
import * as io from 'socket.io';
import userSubscriptionHandler from './handlers/userSubscriptionHandler';

const httpServer = http.createServer();
const socketServer = new io.Server(httpServer, { cors: { origin: '*' } });
socketServer.on('connection', userSubscriptionHandler);
httpServer.listen(8082, () => {
});