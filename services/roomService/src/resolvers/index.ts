import { userModel as User}  from './../data/models/users/user.model.server';
import { townCreateHandler, townDeleteHandler, townJoinHandler } from "../requestHandlers/CoveyTownRequestHandlers";
import { userInfo } from 'os';

/**
 * All the resolvers are defined here.
 */
export const resolvers = {
  Query: {
   /**
    * Resolver to find a user by id
    * @param _ parent is not used here
    * @param args contains all input arguments
    * @returns user profile matching to the id.
    */
     user: async (_: any, args: any) => {
       try {
         const user = await User.findOne((id: String) => id === args.id)
         return user;
       }
       catch (error) {
         throw error;
       }
    },
    /**
     * Resolver to find all the users in Covey Town.
     * @returns all the users in Covey Town
     */
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
    /**
     *  Resolver to sign up - will be removed if everything is done in frontend by Auth0.
     * @param _ parent is not used here.
     * @param args represents all the input parameters.
     * @returns the user profile.
     */
    signUp: async (_: any, args: any) => {
      try {
        const user = await User.findOne({ email: args.input.email });
        if (user) {
          throw new Error("User already in use");
        }
        const newUser = new User({ userName: args.input.userName, email: args.input.email, password: args.input.password });
        const result = newUser.save();
        return result;
      }
      catch (error) {
        throw (error);
      }
    },
    updateUser: async (_: any, args: any) => {
      try {
        var user = await User.findOne({ id: args.input.id});
        if (user !== undefined) {
          
          if (args.input.userName !== undefined) {
            user = await User.findByIdAndUpdate(args.input.id, { userName: args.input.userName  });
          }

          if (args.input.email !== undefined) {
            user = await User.findByIdAndUpdate(args.input.id, { email: args.input.email  });
          }

          if (args.input.password !== undefined) {
            user = await User.findByIdAndUpdate(args.input.id, { password: args.input.password  });
          }
          return  user;
        }
        else {
          throw new Error("User does not exist");
        }

      }
      catch (error) {
        console.log(error);
        throw (error);
      }

    },
    deleteUser: async (_: any, args: any) => {
      try {
        const user = await User.findOne({ email: args.input.email});
        if (user !== undefined ) {
          await User.remove({ email: args.input.email  });
          return true;
        }
        else {
          throw new Error("User does not exist");
        }

      }
      catch (error) {
        console.log(error);
        throw (error);
      }

    },
    // Below are functions already existing and refactored. 
    /**
     * Resolver to handle town join request.
     * @param _ parent arguments not used here.
     * @param args represents the arguments to the function
     * @returns TownJoinResponse
     */
    townJoinRequest: async (_: any, args: any) => {
      return await townJoinHandler({
        userName: args.input.userName,
        coveyTownID: args.input.coveyTownID,
      });
    },

    /**
     *  Resolver to handle town create request.
     * @param _ parent arguments not used here.
     * @param args represents the arguments to the function
     * @returns TownCreateResponse
     */
    townCreateRequest: async (_: any, args: any) => {
      return await townCreateHandler({
        friendlyName: args.input.friendlyName,
        isPubliclyListed: args.input.isPubliclyListed,
      });
    },

    townDeleteRequest: async (_: any, args: any) => {
      const response = await townDeleteHandler({
        coveyTownID: args.input.coveyTownID,
        coveyTownPassword: args.input.coveyTownPassword,
      });
      return response;
    },
  }
};