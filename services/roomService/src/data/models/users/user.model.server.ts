let mongoose = require('mongoose');
let userSchema = require('./user.schema.server');
let userModel = mongoose.model('UserModel', userSchema);

module.exports = userModel;