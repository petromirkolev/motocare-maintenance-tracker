import { Router } from 'express';
import { UpsertMaintenanceBody } from '../types/maintenance';
import {
  isNonNegativeInteger,
  isPositiveInteger,
  isValidIsoLikeDate,
  normalizeString,
} from '../utils/validation';
import {
  createMaintenance,
  findMaintenanceByBikeAndName,
  listMaintenanceByBikeId,
  updateMaintenance,
} from '../services/maintenance-service';

const maintenanceRouter = Router();

maintenanceRouter.get('/', async (req, res) => {
  const bike_id = String(req.query.bike_id ?? '').trim();

  if (!bike_id) {
    res.status(400).json({ error: 'bike_id query param is required' });
    return;
  }

  try {
    const maintenance = await listMaintenanceByBikeId(bike_id);
    res.json({ maintenance });
  } catch (error) {
    console.error('List maintenance failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

maintenanceRouter.post('/log', async (req, res) => {
  const body = (req.body ?? {}) as UpsertMaintenanceBody;
  const bike_id = normalizeString(body.bike_id);
  const name = normalizeString(body.name);
  const { date, odo, interval_km, interval_days } = body;

  if (!bike_id || !name) {
    res.status(400).json({ error: 'bike_id and name are required' });
    return;
  }

  if (date === undefined && odo === undefined) {
    res.status(400).json({
      error: 'At least one maintenance log field must be provided',
    });
    return;
  }

  if (date !== undefined && date !== null && !isValidIsoLikeDate(date)) {
    res.status(400).json({ error: 'Invalid date' });
    return;
  }

  if (odo !== undefined && odo !== null && !isNonNegativeInteger(odo)) {
    res.status(400).json({ error: 'odo must be a non-negative integer' });
    return;
  }

  try {
    const existing = await findMaintenanceByBikeAndName(bike_id, name);

    if (!existing) {
      await createMaintenance({
        bike_id,
        name: name.trim(),
        date: date ?? null,
        odo: odo ?? null,
        interval_km: interval_km ?? null,
        interval_days: interval_days ?? null,
      });

      res.status(201).json({ message: 'Maintenance created successfully' });
      return;
    }

    await updateMaintenance({
      id: existing.id,
      bike_id,
      name: name.trim(),
      date: date ?? existing.date,
      odo: odo ?? existing.odo,
      interval_km: interval_km ?? existing.interval_km,
      interval_days: interval_days ?? existing.interval_days,
    });

    res.json({ message: 'Maintenance updated successfully' });
  } catch (error) {
    console.error('Upsert maintenance failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

maintenanceRouter.post('/schedule', async (req, res) => {
  const body = (req.body ?? {}) as UpsertMaintenanceBody;
  const bike_id = normalizeString(body.bike_id);
  const name = normalizeString(body.name);
  const { interval_km, interval_days } = body;

  if (!bike_id || !name) {
    res.status(400).json({ error: 'bike_id and name are required' });
    return;
  }

  if (interval_km === undefined || interval_km === null) {
    res.status(400).json({ error: 'interval_km is required' });
    return;
  }

  if (interval_days === undefined || interval_days === null) {
    res.status(400).json({ error: 'interval_days is required' });
    return;
  }

  if (!isPositiveInteger(interval_km)) {
    res.status(400).json({ error: 'interval_km must be a positive integer' });
    return;
  }

  if (!isPositiveInteger(interval_days)) {
    res.status(400).json({ error: 'interval_days must be a positive integer' });
    return;
  }

  try {
    const existing = await findMaintenanceByBikeAndName(bike_id, name);

    if (!existing) {
      await createMaintenance({
        bike_id,
        name: name.trim(),
        date: null,
        odo: null,
        interval_km,
        interval_days,
      });

      res.status(201).json({ message: 'Maintenance scheduled successfully' });
      return;
    }

    await updateMaintenance({
      id: existing.id,
      bike_id,
      name: name.trim(),
      date: existing.date,
      odo: existing.odo,
      interval_km,
      interval_days,
    });

    res.json({ message: 'Maintenance scheduled successfully' });
  } catch (error) {
    console.error('Upsert maintenance failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default maintenanceRouter;
