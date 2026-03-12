import sqlite3 from 'sqlite3';

const DB_PATH = process.env.DB_PATH || './data/motocare.sqlite';

export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite:', err.message);
    return;
  }

  console.log('Connected to SQLite');

  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL
      )
    `,
    (tableErr) => {
      if (tableErr) {
        console.error('Failed to create users table:', tableErr.message);
        return;
      }

      console.log('Users table is ready');
    },
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS bikes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      odo INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id))
      `,
    (tableErr) => {
      if (tableErr) {
        console.error('Failed to create bikes table:', tableErr.message);
        return;
      }

      console.log('Bikes table is ready');
    },
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS maintenance (
      id TEXT PRIMARY KEY,
      bike_id TEXT NOT NULL,
      name TEXT NOT NULL,
      date TEXT,
      odo INTEGER,
      interval_km INTEGER,
      interval_days INTEGER,
      created_at TEXT NOT NULL,
      FOREIGN KEY (bike_id) REFERENCES bikes(id))
      `,
    (tableErr) => {
      if (tableErr) {
        console.error('Failed to create maintenance table:', tableErr.message);
        return;
      }

      console.log('Maintenance table is ready');
    },
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS maintenance_logs (
      id TEXT PRIMARY KEY,
      bike_id TEXT NOT NULL,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      odo INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (bike_id) REFERENCES bikes(id))
      `,
    (tableErr) => {
      if (tableErr) {
        console.error(
          'Failed to create maintenance logs table:',
          tableErr.message,
        );
        return;
      }

      console.log('Maintenance logs table is ready');
    },
  );
});
