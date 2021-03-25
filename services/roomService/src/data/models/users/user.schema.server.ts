 const mongoos = require('mongoose');
let userSchema = mongoos.Schema({
    username: String,
    email: String,
    password: String,          
    }, {collection:'User'});

module.exports = userSchema;
 