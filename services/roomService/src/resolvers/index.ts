import { AuthenticationError } from 'apollo-server-express';
import User from '../data/models/users/user.model.server';
import {
  townCreateHandler,
  townJoinHandler,
  townDeleteHandler,
  townListHandler,
  townUpdateHandler,
} from '../requestHandlers/CoveyTownRequestHandlers';

/**
 * All the resolvers are defined here.
 */
const resolvers = {
  Query: {
    /**
     * Resolver to find all the users in Covey Town.
     * @returns all the users in Covey Town
     */
    users: async (_: void, __: void, context: Record<string, unknown>) : Promise<unknown> => {
      try {
        await context.user;
        const users = User.find();
        return users;
      } catch (error) {
        throw new AuthenticationError('You must be logged in to do this');
      }
    },
    searchUserByUserName: async (_: void, args: {username: string}, context:Record<string, unknown>) : Promise<unknown> => {
      try {
        await context.user;
        const response = await User.find({
          username: { $regex: args.username, $options: 'i' },
        });
        return response;
      } catch (error) {
        throw new AuthenticationError('You must be logged in to do this');
      }
    },
    searchUserByName: async (_: void, args: {username: string}, context:Record<string, unknown>) : Promise<unknown>  => {
      try {
        await context.user;
        const user = await User.findOne({ username: args.username });
        return user;
      } catch (error) {
        throw new AuthenticationError('You must be logged in to do this');
      }
    },
    townList: async (_: void, __: void, context: Record<string, unknown>) : Promise<unknown> => {
      try {
        await context.user;
        const response = await townListHandler();
        return response;
      } catch (error) {
        throw new AuthenticationError('You must be logged in to do this');
      }
    },
    /**
     * Resolver to find a user by email
     * @param _ parent is not used here
     * @param args contains all input arguments
     * @returns user profile matching to the id.
     */
    searchUserByEmail: async (_: void, args: {email: string}, context: Record<string, unknown>) : Promise<unknown> => {
      try {
        await context.user;
        const user = await User.findOne({ email: args.email });
        return user;
      } catch (error) {
        throw new AuthenticationError('You must be logged in to do this');
      }
    },
  },

  Mutation: {
    /**
     *  Resolver to sign up - will be removed if everything is done in frontend by Auth0.
     * @param _ parent is not used here.
     * @param args represents all the input parameters.
     * @returns the user profile.
     */
    signUp: async (_: void, args: {input : {email: string, username: string, password:string }}) : Promise<unknown> => {
      const user = await User.findOne({ email: args.input.email });
      if (user) {
        throw new Error('User already in use');
      }
      const newUser = new User({
        username: args.input.username,
        email: args.input.email,
        password: args.input.password,
      });
      const result = newUser.save();
      return result;
    },
    updateUser: async (_: void, args: { input : { id: string, bio: string, location: string, occupation:string, instagramLink: string, facebookLink: string, linkedInLink: string }}, context: Record<string, unknown>) : Promise<unknown> => {
      try {
        await context.user;
        let user = await User.findOne({ id: args.input.id });
        if (user !== undefined) {
          if (args.input.bio !== undefined) {
            user = await User.findByIdAndUpdate(args.input.id, {
              bio: args.input.bio,
            }, {new: true});
          }
          if (args.input.location !== undefined) {
            user = await User.findByIdAndUpdate(args.input.id, {
              location: args.input.location,
            }, {new: true});
          }
          if (args.input.occupation !== undefined) {
            user = await User.findByIdAndUpdate(args.input.id, {
              occupation: args.input.occupation,
            }, {new: true});
          }
          if (args.input.instagramLink !== undefined) {
            user = await User.findByIdAndUpdate(args.input.id, {
              instagramLink: args.input.instagramLink,
            }, {new: true});
          }
          if (args.input.facebookLink !== undefined) {
            user = await User.findByIdAndUpdate(args.input.id, {
              facebookLink: args.input.facebookLink,
            }, {new: true});
          }
          if (args.input.linkedInLink !== undefined) {
            user = await User.findByIdAndUpdate(args.input.id, {
              linkedInLink: args.input.linkedInLink,
            }, {new: true});
          }
          return user;
        }
        throw new Error('User does not exist');
      } catch (error) {
        throw new AuthenticationError('You must be logged in to do this');
      }
    },
    acceptFriend: async (_: void, args: {input: {userNameTo: string, userNameFrom: string}}, context: Record<string, unknown>) : Promise<unknown> => {
      try {
        await context.user;
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
        throw new AuthenticationError('You must be logged in to do this');
      }
    },
    rejectFriend: async (_: void, args: {input: {userNameTo: string, userNameFrom: string}}, context: Record<string, unknown>) : Promise<unknown> => {
      try {
        await context.user;
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
        return true;
      } catch (error) {
        throw new AuthenticationError('You must be logged in to do this');
      }
    },
    addFriend: async (_: void, args: {input: {userNameTo: string, userNameFrom: string}}, context: Record<string, unknown>) : Promise<unknown> => {
      try {
        await context.user;
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
        throw new AuthenticationError('You must be logged in to do this');
      }
    },
    deleteUser: async (_: void, args: {input: {email: string}}, context: Record<string, unknown>) : Promise<unknown> => {
      try {
        await context.user;
        const user = await User.findOne({ email: args.input.email });
        if (user !== undefined) {
          await User.remove({ email: args.input.email });
          return true;
        }
        return false;
      } catch (error) {
        throw new AuthenticationError('You must be logged in to do this');
      }
    },
    // Below are functions already existing and refactored.
    /**
     * Resolver to handle town join request.
     * @param _ parent arguments not used here.
     * @param args represents the arguments to the function
     * @returns TownJoinResponse
     */
    townJoinRequest: async (_: void, args: {input: {userName: string, coveyTownID: string}}, context: Record<string, unknown>) : Promise<unknown> => {
      try {
        await context.user;
        const response = await townJoinHandler({
          userName: args.input.userName,
          coveyTownID: args.input.coveyTownID,
        });
        return response;
      } catch (error) {
        throw new AuthenticationError('You must be logged in to do this');
      }
    },

    /**
     *  Resolver to handle town create request.
     * @param _ parent arguments not used here.
     * @param args represents the arguments to the function
     * @returns TownCreateResponse
     */
    townCreateRequest: async (_: void, args: {input: {friendlyName: string, isPubliclyListed: boolean}}, context: Record<string, unknown>) : Promise<unknown> => {
      try {
        await context.user;
        return await townCreateHandler({
          friendlyName: args.input.friendlyName,
          isPubliclyListed: args.input.isPubliclyListed,
        });
      } catch (error) {
        throw new AuthenticationError('You must be logged in to do this');
      }
    },
    townDeleteRequest: async (_: void, args: {input: {coveyTownID: string, coveyTownPassword: string}}, context: Record<string, unknown>) : Promise<unknown> => {
      try {
        await context.user;
        const response = await townDeleteHandler({
          coveyTownID: args.input.coveyTownID,
          coveyTownPassword: args.input.coveyTownPassword,
        });
        return response;
      } catch (error) {
        throw new AuthenticationError('You must be logged in to do this');
      }
    },
    townUpdateRequest: async (_: void, args: {input: {coveyTownID: string, coveyTownPassword: string, friendlyName: string, isPubliclyListed: boolean }}, context: Record<string, unknown>) : Promise<unknown> => {
      try {
        await context.user;
        const response = await townUpdateHandler({
          coveyTownID: args.input.coveyTownID,
          coveyTownPassword: args.input.coveyTownPassword,
          friendlyName: args.input.friendlyName,
          isPubliclyListed: args.input.isPubliclyListed,
        });
        return response;
      } catch (error) {
        throw new AuthenticationError('You must be logged in to do this');
      }
    },
  },
};

export default resolvers;
