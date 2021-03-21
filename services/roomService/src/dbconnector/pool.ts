import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const connectionString = process.env.ELEPHANTSQL_CONNECTION_STRING;
const pool = new Pool({ connectionString });

export default pool;
