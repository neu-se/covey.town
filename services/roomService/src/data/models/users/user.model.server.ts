/* let mongooseD = require('mongoose'); */
import mongoose from 'mongoose';
import { userSchema } from './user.schema.server';
export const userModel = mongoose.model('User', userSchema);
