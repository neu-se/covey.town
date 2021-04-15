import mongoose from 'mongoose';
import resolvers from '../resolvers';
import { userModel as User } from '../data/models/users/user.model.server';

beforeAll(async () => {
  const uri =
    'mongodb+srv://user:user@cluster0.y7ubd.mongodb.net/CoveyTown?retryWrites=true&w=majority';
  const connection = async () => {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Database connected successfully');
  };
  connection();
});

// describe('getAllUsers', () => {
//   it('gets a list of all users', async () => {
//     const result = await resolvers.Query.users();
//     expect(result.length).toMatchSnapshot();
//   });
// });

describe('signUp', () => {
    it('creates a user', async () => {
        const userData = {
            userName: "testCoveyTownUser",
            email: "jk136487@gmail.com",
            password: "Testuser@123"
        }
        const user = await resolvers.Mutation.signUp({
            
        }, { input: userData},{}
              
        );
        // console.log(user.email);
    //   const userDb = await resolvers.Query.searchUserByEmail({},{input:{email: "jk16@gmail.com"}})
    //   expect(user).toEqual(userDb);
        
        
  });
});