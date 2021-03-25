export {};
const express = require('express');
const { ApolloServer ,gql} = require('apollo-server-express');
const app = express();
const cors = require('cors');
const { connection } = require('./data/Utils/index.ts');

app.use(express.json());
app.use(cors());
const typeDefs  = require('./typeDefs/index.ts')
const resolvers = require('./resolvers/index.ts')

//GETTING INSTANCE OF APOLLO SERVER
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers
});


apolloServer.applyMiddleware({ app, path: '/graphql' });


connection();

app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));