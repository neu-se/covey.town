import CORS from 'cors';
import Express from 'express';
import * as http from 'http';
import mongoose from 'mongoose';
import { AddressInfo } from 'net';
import CoveyTownsStore from './lib/CoveyTownsStore';
import addTownRoutes from './router/towns';
import users from './router/users';

const app = Express();
app.use(CORS());
app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

users(app);

const uri = `mongodb+srv://${process.env.MONGO_USER}:${encodeURIComponent(
  process.env.MONGO_PASSWORD || '',
)}@coveytownusers.w8gis.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

const options = { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };

mongoose
  .connect(uri, options)
  .then(() => {
    console.log('Connected to DB');
  })
  .catch(error => {
    throw error;
  });

const server = http.createServer(app);

addTownRoutes(server, app);

server.listen(process.env.PORT || 8081, () => {
  const address = server.address() as AddressInfo;
  // eslint-disable-next-line no-console
  console.log(`Listening on ${address.port}`);
  if (process.env.DEMO_TOWN_ID) {
    CoveyTownsStore.getInstance().createTown(process.env.DEMO_TOWN_ID, false);
  }
});
