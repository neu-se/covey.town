import { knex } from 'knex';

const config = {
  client: 'pg',
  version: '13.2',
  connection: {
    host: 'ec2-54-198-73-79.compute-1.amazonaws.com',
    user: 'icridlnxdbloht',
    password: '84d913975142cfa20467bb6606e88097a0411c2f1561b9c3c31920282ce6728c',
    database: 'dodhf94vtm4s9',
    ssl: { rejectUnauthorized: false },
  },
};

const db = knex(config);

export default db;
