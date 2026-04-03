import { Pool } from 'pg';
import { msg } from './constants/constants';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(msg.SYS_DB_URL_REQ);
}

export const db = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});
