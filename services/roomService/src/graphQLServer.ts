import Express from 'express';
import CORS from 'cors';
import { ApolloServer } from 'apollo-server-express';
import io from 'socket.io';
import {
  townSubscriptionHandler,
} from './requestHandlers/CoveyTownRequestHandlers';
import { connection } from './data/Utils/index';
import typeDefs from './typeDefs/index';
import resolvers from './resolvers/index';



const app = Express();
app.use(Express.json());
app.use(CORS());

/**
 * Getting the instance of Apollo Server.
 */
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});


apolloServer.applyMiddleware({ app, path: '/graphql' });
 
// Represents the database connection
connection();

const http = app.listen(process.env.PORT || 8081, () => console.log('Listening'));
const socketServer = new io.Server(http, { cors: { origin: '*' } });
socketServer.on('connection', townSubscriptionHandler);