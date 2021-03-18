const { tasks, users } = require('./constants/index.ts');
const User = require('./data/Models/user.ts')

module.exports = {
  Query: {
    users: () => users,
    user: (parent: any, args: any) => users.find((user: any) => user.id === args.id)
  },

  Mutation: {
    signUp: async (parent: any, args: any) => {
      try {
        const user = await User.findOne({ email: args.input.email });
        if (user) {
          throw new Error("User already in use");
        }
        const newUser = new User({ ...args.input });
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