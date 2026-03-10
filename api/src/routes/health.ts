import { Router } from 'express';
import { db } from '../db';

const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({ ok: true });
});

healthRouter.get('/db', (_req, res) => {
  db.get('SELECT 1 AS ok', (_err, row) => {
    res.json({ ok: true, db: row });
  });
});

export default healthRouter;
