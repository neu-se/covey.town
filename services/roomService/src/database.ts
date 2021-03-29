import mongoose = require("mongoose");

let database: mongoose.Connection;
export const connect = () => {
  // add your own uri below
  const uri = "mongodb+srv://admin:admin@development.m8wxo.mongodb.net/chatroom?retryWrites=true&w=majority";
  if (database) {
    return;
  }
  mongoose.connect(uri, {
    useNewUrlParser: true,
    useFindAndModify: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
  database = mongoose.connection;
  database.once("open", async () => {
    console.log("Connected to database");
  });
  database.on("error", () => {
    console.log("Error connecting to database");
  });
};
export const disconnect = () => {
  if (!database) {
    return;
  }
  mongoose.disconnect();
};