import mongoose from 'mongoose';
import userSchema from './user.schema.server';

const userModel = mongoose.model('User', userSchema);
export default userModel;
