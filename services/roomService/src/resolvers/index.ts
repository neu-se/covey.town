const { tasks, users } = require('./constants/index.ts');
const User = require('./data/Models/user.ts')
module.exports = {
  Query: {
    greetings: () => "Hello",
    tasks: () => tasks,
    task: (parent: any, args: any) => tasks.find((task: any) => task.id === args.id),
    users: () => users,
    user: (parent: any, args: any) => users.find((user: any) => user.id === args.id)
  },
  Task: {
    user: (parent: any) => users.find((user: any) => user.id === parent.userId)
  },
  User: {
    tasks: (parent: any) => tasks.filter((task: any) => task.id === parent.id)
  },
  Mutation: {
    createTask: (parent: any, args: any) => {
      const task = { ...args, id: 1 };
      tasks.push(task);
      return task;
    },
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