export {};
const express = require('express');
const { ApolloServer ,gql} = require('apollo-server-express');
const app = express();
const cors = require('cors');
const { connection } = require('./data/Utils/index.ts');
const { tasks, users } = require('./constants/index.ts')
const User = require('./data/Models/users/user.model.server.ts') 
app.use(express.json());
app.use(cors());
const typeDefs  = require('./typeDefs/index.ts')
/* const resolvers  = require('./resolvers/index.ts')  */

 const resolvers = {
  Query: {
    greetings: () => "Hello",
    users: () => users,
    user: (parent: any, args: any) => users.find((user: any) => user.id === args.id)
  },
  Mutation: {
    signUp: async (parent: any, args: any) => {
      try {
        console.log(args.input);
        console.log(args.input.email);
        const user = await User.findOne({ email: args.input.email });
        if (user) {
          throw new Error("User already in use");
        }
        const newUser = new User({ name: args.input.name, email: args.input.email, password: args.input.password });
        const result = newUser.save();
        return result;
      }
      catch (error) {
        console.log(error);
        throw (error);
      }
    }
    
  }
}; 
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers
});
apolloServer.applyMiddleware({ app, path: '/graphql' });
app.use('/', (req:any, res:any, next:any) => {
  res.send({ message: 'Hello' });
})
connection();
app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));