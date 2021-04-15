import Express from 'express';
import CORS from 'cors';
import { ApolloServer } from 'apollo-server-express';
import io from 'socket.io';
import * as jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import {
  townSubscriptionHandler,
} from './requestHandlers/CoveyTownRequestHandlers';
import connection from './data/Utils/index';
import typeDefs from './typeDefs/index';
import resolvers from './resolvers/index';

const app = Express();
app.use(Express.json());
app.use(CORS());

// Authentication
const client = jwksRsa({
  jwksUri: 'https://dev-fse.us.auth0.com/.well-known/jwks.json',
});

function getKey(header: any, cb: any) : any{
  client.getSigningKey(header.kid, (_:any, key: any) : any=> {
    const signingKey = key.publicKey || key.rsaPublicKey;
    cb(null, signingKey);
  });
}

const options = {
  aud: 'NdeXvvGPAeAeNsCGO4bxyzuaCSNKtjYK',
  issuer: 'https://dev-fse.us.auth0.com/',
  algorithm: 'RS256',
};

/**
 * Getting the instance of Apollo Server.
 */
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) :any => {
    // simple auth check on every request
    const token = req.headers.authorization || '';
    const user = new Promise((resolve, reject) : any=> {
      jwt.verify(token, getKey, options, (err : any, decoded: any):any => {
        if (err) {
          return reject(err);
        }
        return resolve((decoded as any).email);

      });
    });

    return { user };

  },
});


apolloServer.applyMiddleware({ app, path: '/graphql' });
 
// Represents the database connection
connection();

const http = app.listen(process.env.PORT || 8081, () => console.log('Listening'));
const socketServer = new io.Server(http, { cors: { origin: '*' } });
socketServer.on('connection', townSubscriptionHandler);