import { userInfo } from 'os';
import { userModel as User } from '../data/models/users/user.model.server';
import {
  townCreateHandler,
  townJoinHandler,
  townDeleteHandler,
} from '../requestHandlers/CoveyTownRequestHandlers';
/**
 * All the resolvers are defined here.
 */
const resolvers = {
  Query: {
    /**
     * Resolver to find a user by id
     * @param _ parent is not used here
     * @param args contains all input arguments
     * @returns user profile matching to the id.
     */
    searchUserById: async (_: any, args: any) => {
      const user = await User.findOne((id: string) => id === args.id);
      return user;
    },
    /**
     * Resolver to find all the users in Covey Town.
     * @returns all the users in Covey Town
     */
    users: async () => {
      const users = User.find();
      return users;
    },

    searchUserByUserName: async (_: any, args: any) => {
      const response = await User.find({
        username: { $regex: args.username, $options: 'i' },
      });
      return response;
    },
    searchUserByName: async (_: any, args: any) => {
      const user = await User.findOne({ username: args.username });
      return user;
    },
    /**
     * Resolver to find a user by email
     * @param _ parent is not used here
     * @param args contains all input arguments
     * @returns user profile matching to the id.
     */
    searchUserByEmail: async (_: any, args: any) => {
      const user = await User.findOne({ email: args.email });
      return user;
    },
  },

  Mutation: {
    /**
     *  Resolver to sign up - will be removed if everything is done in frontend by Auth0.
     * @param _ parent is not used here.
     * @param args represents all the input parameters.
     * @returns the user profile.
     */
    signUp: async (_: any, args: any) => {
      const user = await User.findOne({ email: args.input.email });
      if (user) {
        throw new Error('User already in use');
      }
      const newUser = new User({
        username: args.input.userName,
        email: args.input.email,
        password: args.input.password,
      });
      const result = newUser.save();
      return result;
    },
    updateUser: async (_: any, args: any) => {
      let user = await User.findOne({ id: args.input.id });
      if (user !== undefined) {
        if (args.input.bio !== undefined) {
          user = await User.findByIdAndUpdate(args.input.id, {
            bio: args.input.bio,
          });
        }

        if (args.input.location !== undefined) {
          user = await User.findByIdAndUpdate(args.input.id, {
            location: args.input.location,
          });
        }

        if (args.input.occupation !== undefined) {
          user = await User.findByIdAndUpdate(args.input.id, {
            occupation: args.input.occupation,
          });
        }
        if (args.input.instagramLink !== undefined) {
          user = await User.findByIdAndUpdate(args.input.id, {
            instagramLink: args.input.instagramLink,
          });
        }
        if (args.input.facebookLink !== undefined) {
          user = await User.findByIdAndUpdate(args.input.id, {
            facebookLink: args.input.facebookLink,
          });
        }
        if (args.input.linkedInLink !== undefined) {
          user = await User.findByIdAndUpdate(args.input.id, {
            linkedInLink: args.input.linkedInLink,
          });
        }

        if (args.input.password !== undefined) {
          user = await User.findByIdAndUpdate(args.input.id, {
            password: args.input.password,
          });
        }
        return user;
      }
      throw new Error('User does not exist');
    },
    acceptFriend: async (_: any, args: any) => {
      try {
        const query = { username: args.input.userNameTo };
        const updateDocument = {
          $pull: { requests: args.input.userNameFrom },
        };
        await User.updateOne(query, updateDocument);
        const queryFrom = { username: args.input.userNameFrom };
        const updateDocumentFrom = {
          $pull: { sentRequests: args.input.userNameTo },
        };
        await User.updateOne(queryFrom, updateDocumentFrom);
        await User.updateOne(
          { username: args.input.userNameTo },
          { $push: { friends: args.input.userNameFrom } },
        );
        await User.updateOne(
          { username: args.input.userNameFrom },
          { $push: { friends: args.input.userNameTo } },
        );
        return true;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    rejectFriend: async (_: any, args: any) => {
      try {
        const query = { username: args.input.userNameTo };
        const updateDocument = {
          $pull: { requests: args.input.userNameFrom },
        };
        await User.updateOne(query, updateDocument);
        const queryFrom = { username: args.input.userNameFrom };
        const updateDocumentFrom = {
          $pull: { sentRequests: args.input.userNameTo },
        };
        return true;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    addFriend: async (_: any, args: any) => {
      try {
        await User.updateOne(
          { username: args.input.userNameTo },
          { $push: { requests: args.input.userNameFrom } },
        );
        await User.updateOne(
          { username: args.input.userNameFrom },
          { $push: { sentRequests: args.input.userNameTo } },
        );
        return true;
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    deleteUser: async (_: any, args: any) => {
      const user = await User.findOne({ email: args.input.email });
      if (user !== undefined) {
        await User.remove({ email: args.input.email });
        return true;
      }
      return false;
    },
    // Below are functions already existing and refactored.
    /**
     * Resolver to handle town join request.
     * @param _ parent arguments not used here.
     * @param args represents the arguments to the function
     * @returns TownJoinResponse
     */
    townJoinRequest: async (_: any, args: any) => await townJoinHandler({
      userName: args.input.userName,
      coveyTownID: args.input.coveyTownID,
    }),

    /**
     *  Resolver to handle town create request.
     * @param _ parent arguments not used here.
     * @param args represents the arguments to the function
     * @returns TownCreateResponse
     */
    townCreateRequest: async (_: any, args: any) => await townCreateHandler({
      friendlyName: args.input.friendlyName,
      isPubliclyListed: args.input.isPubliclyListed,
    }),

    townDeleteRequest: async (_: any, args: any) => {
      const response = await townDeleteHandler({
        coveyTownID: args.input.coveyTownID,
        coveyTownPassword: args.input.coveyTownPassword,
      });
      return response;
    },
  },
};

export default resolvers;
