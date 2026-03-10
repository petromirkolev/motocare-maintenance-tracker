import sqlite3 from 'sqlite3';

const DB_PATH = './data/motocare.sqlite';

export const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite:', err.message);
    return;
  }

  console.log('Connected to SQLite');

  db.run(
    `
      CREATE TABLE IF NOT EXISTS users (
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
});
