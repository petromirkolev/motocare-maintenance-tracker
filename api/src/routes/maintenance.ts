import { Router } from 'express';

const maintenanceRouter = Router();

maintenanceRouter.get('/', (_req, res) => {
  res.json({ message: 'maintenance route placeholder' });
});

export default maintenanceRouter;
