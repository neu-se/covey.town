let mongooseD = require('mongoose');
let userSchemaImport = require('./user.schema.server.ts');
let userModel = mongooseD.model('User', userSchemaImport);

module.exports = userModel;