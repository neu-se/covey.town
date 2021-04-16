import * as http from 'http';
import * as io from 'socket.io';
import addUserRoutes from './router/friends';

const userServer = http.createServer();
addUserRoutes(userServer);

userServer.listen(process.env.PORT || 8082, () => {
});
