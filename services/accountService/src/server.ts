import Express from 'express';
import * as http from 'http';
import CORS from 'cors';
import { AddressInfo } from 'net';
import addAccountRoutes from './router/accounts';

const app = Express();
app.use(CORS());
const server = http.createServer(app);

addAccountRoutes(server, app)

server.listen(process.env.PORT || 8080, () => {
  const address = server.address() as AddressInfo;
  // eslint-disable-next-line no-console
  console.log(`Listening on ${address.port}`);
});
