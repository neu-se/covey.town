import mongoose from 'mongoose';
const { Schema } = mongoose;
export const userSchema = new Schema({
    userName: String,
    email: String,
    password: String,
}, {collection:'User'});

 