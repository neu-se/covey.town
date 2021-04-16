import mongoose from 'mongoose';

const uri =
  'mongodb+srv://user:user@cluster0.y7ubd.mongodb.net/CoveyTown?retryWrites=true&w=majority';
const connection = async () : Promise<unknown> => {

  const conn =  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  return conn;
};

export default connection;
