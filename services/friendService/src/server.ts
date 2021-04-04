import * as http from 'http';
import * as io from 'socket.io';
import playerSubscriptionHandler from './handlers/playerSubscriptionHandler';

const httpServer = http.createServer();
const socketServer = new io.Server(httpServer, { cors: { origin: '*' } });
socketServer.on('connection', playerSubscriptionHandler);
httpServer.listen(8082, () => {
  console.log('reeee');
});