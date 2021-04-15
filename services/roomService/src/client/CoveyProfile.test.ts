import mongoose from 'mongoose';
import resolvers from '../resolvers';


beforeAll(async () => {
  const uri =
    'mongodb+srv://user:user@cluster0.y7ubd.mongodb.net/CoveyTown?retryWrites=true&w=majority';
  const connection = async () => {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Database connected successfully');
  };
  connection();
});

describe('getAllUsers', () => {
  it('creates a course', async () => {
    const result = await resolvers.Query.users();
    expect(result.length).toMatchSnapshot();
  });
});