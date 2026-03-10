import { Router } from 'express';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { getOne, runQuery } from '../db-helpers';

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
};

const authRouter = Router();

/* Register endpoint */
authRouter.post('/register', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const existingUser = await getOne<UserRow>(
      'SELECT * FROM users WHERE email = ?',
      [email],
    );

    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await runQuery(
      `
        INSERT INTO users (id, email, password_hash, created_at)
        VALUES (?, ?, ?, ?)
      `,
      [uuidv4(), email, passwordHash, new Date().toISOString()],
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/* Login endpoint */
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const user = await getOne<UserRow>('SELECT * FROM users WHERE email = ?', [
      email,
    ]);

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default authRouter;
