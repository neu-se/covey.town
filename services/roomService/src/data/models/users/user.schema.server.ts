 const mongoos = require('mongoose');
let userSchema = mongoos.Schema({
    name: String,
    email: String,
    password: String,          
    }, {collection:'User'});

module.exports = userSchema;
 