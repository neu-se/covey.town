// note: this should be a singleton object. I just wrote this stuff to test the db connection. -CB
import { Knex, knex } from 'knex';

const config: Knex.Config = {
  client: 'pg',
  version: '13.2',
  connection: {
    host : 'ec2-3-91-127-228.compute-1.amazonaws.com',
    user : 'ciwjmrzhmxcnet',
    password : '977f88be1657c4bb2d8550b52244988a7af11963160ff4e83506b7a52564682f',
    database : 'd314d8k6ng2vrk',
  },
};

const knexInstance = knex(config);
// const knex = require('knex')({
//   client: 'pg',
//   version: '13.2',
//   connection: {
//     host : 'ec2-3-91-127-228.compute-1.amazonaws.com',
//     user : 'ciwjmrzhmxcnet',
//     password : '977f88be1657c4bb2d8550b52244988a7af11963160ff4e83506b7a52564682f',
//     database : 'd314d8k6ng2vrk',
//   },
// });


async function testQuery(){
  await knex('test').select('*');
  // console.log(result);
}

testQuery();