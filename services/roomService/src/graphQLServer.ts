var express = require('express');
var { graphqlHTTP } = require('express-graphql');

const schema = require('./schema.ts');
var resolvers = { hello: () => 'Hello world!' };

var app = express();
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    rootValue: resolvers,
    graphiql: true,
  }),
);
app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));
