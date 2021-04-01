import mongoose from 'mongoose';
const { Schema } = mongoose;
export const userSchema = new Schema({
  username: String,
  email: String,
  password: String,
  requests:[String],
  sentRequests:[String],
  friends:[String]
}, {collection:'User'});

