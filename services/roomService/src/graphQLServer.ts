import Express from 'express';
import { ApolloServer, gql } from 'apollo-server-express';
import { connection } from './data/Utils/index';
import typeDefs from './typeDefs/index';
import  resolvers  from './resolvers/index';

const cors = require('cors');

const app = Express();
app.use(Express.json());
app.use(cors());

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

app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));