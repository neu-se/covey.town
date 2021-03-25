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
    login: async (parent: any, args: any) => {
      try {
        const user = await User.findOne({ email: args.input.email, password: args.input.password });
        if (user === null) {
          throw new Error("User does not exist");
        }
        return user;
        // const newUser = new User({ name: args.input.name, email: args.input.email, password: args.input.password });
        // const result = newUser.save();
        // return result;
      }
      catch (error) {
        console.log(error);
        throw (error);
      }
    },
    updateUsername: async (parent: any, args: any) => {
      try {
        const user = await User.findOne({ id: args.input.id });
        if (user !== undefined ) {
          await User.findByIdAndUpdate(args.input.id, { username: args.input.username });
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
    updateEmail: async (parent: any, args: any) => {
      try {
        const user = await User.findOne({ id: args.input.id });
        if (user !== undefined ) {
          await User.findByIdAndUpdate(args.input.id, { email: args.input.email });
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
    updatePassword: async (parent: any, args: any) => {
      try {
        const user = await User.findOne({ id: args.input.id });
        if (user !== undefined ) {
          await User.findByIdAndUpdate(args.input.id, { password: args.input.password });
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
    deleteUser: async (parent: any, args: any) => {
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
      
    }
    
  }
};