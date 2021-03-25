import mongoose from 'mongoose';
const uri =
  'mongodb+srv://user:user@cluster0.y7ubd.mongodb.net/CoveyTown?retryWrites=true&w=majority';
export const connection = async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Database connected successfully");
  }
  catch (error) {
    throw error;
  }
}