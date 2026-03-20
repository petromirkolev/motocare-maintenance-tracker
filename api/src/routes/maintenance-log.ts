import { Router } from 'express';
import { CreateMaintenanceLogBody } from '../types/maintenance-log';
import {
  isNonNegativeInteger,
  isValidIsoLikeDate,
  normalizeString,
} from '../utils/validation';
import {
  createMaintenanceLog,
  listMaintenanceLogsByBikeId,
} from '../services/maintenance-log-service';

const maintenanceLogsRouter = Router();

maintenanceLogsRouter.get('/', async (req, res) => {
  const bike_id = String(req.query.bike_id ?? '').trim();

  if (!bike_id) {
    res.status(400).json({ error: 'bike_id query param is required' });
    return;
  }

  try {
    const logs = await listMaintenanceLogsByBikeId(bike_id);
    res.json({ logs });
  } catch (error) {
    console.error('List maintenance logs failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

maintenanceLogsRouter.post('/', async (req, res) => {
  const body = (req.body ?? {}) as CreateMaintenanceLogBody;

  const bike_id = normalizeString(body.bike_id);
  const name = normalizeString(body.name);
  const { date, odo } = body;

  if (!bike_id || !name || !date || odo === undefined) {
    res
      .status(400)
      .json({ error: 'bike_id, name, date, and odo are required' });
    return;
  }

  if (!isValidIsoLikeDate(date)) {
    res.status(400).json({ error: 'Invalid date' });
    return;
  }

  if (!isNonNegativeInteger(odo)) {
    res.status(400).json({ error: 'Odo must be a non-negative integer' });
    return;
  }

  try {
    await createMaintenanceLog({
      bike_id,
      name: name.trim(),
      date,
      odo: Number(odo),
    });

    res.status(201).json({ message: 'Maintenance log created successfully' });
  } catch (error) {
    console.error('Create maintenance log failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default maintenanceLogsRouter;
