import Express from 'express';
import * as http from 'http';
import CORS from 'cors';
import { AddressInfo } from 'net';
import addTownRoutes from './router/towns';
import CoveyTownsStore from './lib/CoveyTownsStore';
import addUserRoutes from './router/friends';

const app = Express();
app.use(CORS());
const server = http.createServer(app);

// Creates a friend request server
const userServer = http.createServer();

addUserRoutes(userServer);

addTownRoutes(server, app);

userServer.listen(8082, () => {
});


server.listen(process.env.PORT || 8081, () => {
  const address = server.address() as AddressInfo;
  // eslint-disable-next-line no-console
  console.log(`Listening on ${address.port}`);
  // if (process.env.DEMO_TOWN_ID) {
  //   const newTown = (await CoveyTownsStore.getInstance())
  //     .createTown(process.env.DEMO_TOWN_ID, false);
  // }
});
