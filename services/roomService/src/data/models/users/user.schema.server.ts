const mongoose = require('mongoose');
let userSchema = mongoose.Schema({
                                     username: String,
                                     password: String,
                                     email: String,
                                     friends: [],
                                 }, {collection:'user'});

module.exports = userSchema;
