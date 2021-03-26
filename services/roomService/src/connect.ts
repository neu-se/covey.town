import mongoose from 'mongoose';

type TInput = {
  db: string;
};
export default ({db}: TInput):void => {

  const connect = () => {
    mongoose
      .connect(
        db,
        { useNewUrlParser: true },
      )
      .then()
      .catch(() => process.exit(1));
  };
  connect();

  mongoose.connection.on('disconnected', connect);
};
