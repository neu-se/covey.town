import { townCreateHandler, townJoinHandler } from "../requestHandlers/CoveyTownRequestHandlers";

const User = require('../data/Models/users/user.model.server.ts')


module.exports = {
 Query: {
     user: async (_: any, args: any) => {
       try {
         const user = await User.findOne((id: String) => id === args.id)
         return user;
       }
       catch (error) {
         throw error;
       }
     },
     users: async () => {
       try {
         const users = User.find();
         return users;
       }
       catch (error) {
         throw error;
       }
     }

  },
  Mutation: {
    signUp: async (_: any, args: any) => {
      try {
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
    },

    townJoinRequest: async (_: any, args: any) => {
      return await townJoinHandler({
        userName: args.input.userName,
        coveyTownID: args.input.coveyTownID,
      });
    },
    townCreateRequest: async (_: any, args: any) => {
      console.log("reached here");
      const response = await townCreateHandler({
        friendlyName: args.input.friendlyName,
        isPubliclyListed: args.input.isPubliclyListed,
      });
      console.log(response);
      return response;
    }
  }
};