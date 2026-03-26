const { Client } = require('pg');
require('dotenv').config({ path: 'api/.env.test' });

async function resetTestDb() {
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL is required for test runs');
  }
  const databaseUrl = process.env.TEST_DATABASE_URL;

  const client = new Client({
    connectionString: databaseUrl,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  });

  await client.connect();

  try {
    await client.query(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`);

    await client.query(`
  CREATE TABLE IF NOT EXISTS bikes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    odo INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

    await client.query(`
  CREATE TABLE IF NOT EXISTS maintenance (
    id TEXT PRIMARY KEY,
    bike_id TEXT NOT NULL,
    name TEXT NOT NULL,
    date TEXT,
    odo INTEGER,
    interval_km INTEGER,
    interval_days INTEGER,
    created_at TEXT NOT NULL,
    FOREIGN KEY (bike_id) REFERENCES bikes(id)
  )
`);

    await client.query(`
  CREATE TABLE IF NOT EXISTS maintenance_logs (
    id TEXT PRIMARY KEY,
    bike_id TEXT NOT NULL,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    odo INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (bike_id) REFERENCES bikes(id)
  )
`);

    await client.query(`
  TRUNCATE TABLE maintenance_logs, maintenance, bikes, users CASCADE
`);

    console.log('Test database reset complete');
  } finally {
    await client.end();
  }
}

resetTestDb().catch((error) => {
  console.error('Failed to reset test database:', error);
  process.exit(1);
});
