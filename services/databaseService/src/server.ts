import CORS from "cors";
import Express from "express";
import * as http from "http";
import { AddressInfo } from "net";
import addDBRoutes from "./router/database";

const app = Express();
app.use(CORS());
const server = http.createServer(app);
addDBRoutes(server, app);
server.listen(process.env.PORT || 8081, () => {
  const address = server.address() as AddressInfo;
  // eslint-disable-next-line no-console
  console.log(`Listening on ${address.port}`);
});
