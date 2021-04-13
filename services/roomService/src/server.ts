import Express from 'express';
import * as http from 'http';
import CORS from 'cors';
import { AddressInfo } from 'net';
import addTownRoutes from './router/towns';
import CoveyTownsStore from './lib/CoveyTownsStore';

const app = Express();
app.use(CORS());
const server = http.createServer(app);

addTownRoutes(server, app);

server.listen(process.env.PORT || 8081, () => {
  const address = server.address() as AddressInfo;
  // eslint-disable-next-line no-console
  console.log(`Listening on ${address.port}`);
  if (process.env.DEMO_TOWN_ID) {
    CoveyTownsStore.getInstance()
      .createTown(process.env.DEMO_TOWN_ID, false);
  }
});
