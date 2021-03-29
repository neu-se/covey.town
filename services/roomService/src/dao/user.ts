const mongoose = require('mongoose');
const {Schema, model} = mongoose;
const UserSchema = new Schema({
  username: {type: String, required: true, index: true, unique: true},
  password: {type: String, required: true},
  email: {type: String},
  gender: {
      type: String,
      enum: ['male', 'female'],
      default: 'male',
      required: true
  },
  born_year: Number,
  city: String
});
// This model is mapping to MongoDB 'user' collection
export const UserModel = model('User', UserSchema, 'user');

export const createUser = async (user_instance: Object) => {
    return await UserModel.create(user_instance);
}

export const getUserByName = async (name: String) => {
    const filter = { username: name };
    return await UserModel.findOne(filter);
}

export const updateUserByName = async (name: String, updated_info: Object) => {
    const filter = { username: name };
    return UserModel.findOneAndUpdate(filter, updated_info);
}

export const deleteUserByName = async (name: String) => {
    return UserModel.deleteOne({username: name});
}
// Example:
// const user_instance = { username: 'TestUser', password: 'passw0rd' };
// createUser(user_instance); # Insert User into db
// updateUserByName('TestUser', {gender: 'female'}); # Update user information

