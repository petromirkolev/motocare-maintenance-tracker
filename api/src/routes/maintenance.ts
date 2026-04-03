import { Router } from 'express';
import { UpsertMaintenanceBody } from '../types/maintenance';
import { msg } from '../constants/constants';
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
    res.status(400).json({ error: msg.BIKE_PARAM });
    return;
  }

  try {
    const maintenance = await listMaintenanceByBikeId(bike_id);
    res.json({ maintenance });
  } catch (error) {
    console.error(msg.MAINTENANCE_LIST_FAIL, error);
    res.status(500).json({ error: msg.INTERNAL_SERVER_ERROR });
  }
});

maintenanceRouter.post('/log', async (req, res) => {
  const body = (req.body ?? {}) as UpsertMaintenanceBody;
  const bike_id = normalizeString(body.bike_id);
  const name = normalizeString(body.name);
  const { date, odo, interval_km, interval_days } = body;

  if (!bike_id || !name) {
    res.status(400).json({ error: msg.BIKE_AND_NAME_PARAMS });
    return;
  }

  if (date === undefined && odo === undefined) {
    res.status(400).json({
      error: msg.MAINTENANCE_LOG_FIELDS,
    });
    return;
  }

  if (date !== undefined && date !== null && !isValidIsoLikeDate(date)) {
    res.status(400).json({ error: msg.INVALID_DATE });
    return;
  }

  if (odo !== undefined && odo !== null && !isNonNegativeInteger(odo)) {
    res.status(400).json({ error: msg.ODO_NON_NEG });
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

      res.status(201).json({ message: msg.MAINTENANCE_CREATE_SUCCESS });
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

    res.json({ message: msg.MAINTENANCE_UPDATE_SUCCESS });
  } catch (error) {
    console.error(msg.MAINTENANCE_UPDATE_FAIL, error);
    res.status(500).json({ error: msg.INTERNAL_SERVER_ERROR });
  }
});

maintenanceRouter.post('/schedule', async (req, res) => {
  const body = (req.body ?? {}) as UpsertMaintenanceBody;
  const bike_id = normalizeString(body.bike_id);
  const name = normalizeString(body.name);
  const { interval_km, interval_days } = body;

  if (!bike_id || !name) {
    res.status(400).json({ error: msg.BIKE_AND_NAME_PARAMS });
    return;
  }

  if (interval_km === undefined || interval_km === null) {
    res.status(400).json({ error: msg.INT_KM_PARAM });
    return;
  }

  if (interval_days === undefined || interval_days === null) {
    res.status(400).json({ error: msg.INT_DAYS_PARAM });
    return;
  }

  if (!isPositiveInteger(interval_km)) {
    res.status(400).json({ error: msg.INT_KM_POSITIVE });
    return;
  }

  if (!isPositiveInteger(interval_days)) {
    res.status(400).json({ error: msg.INT_DAYS_POSITIVE });
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

      res.status(201).json({ message: msg.MAINTENANCE_SCHEDULE_SUCCESS });
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

    res.json({ message: msg.MAINTENANCE_SCHEDULE_SUCCESS });
  } catch (error) {
    console.error(msg.MAINTENANCE_UPDATE_FAIL, error);
    res.status(500).json({ error: msg.INTERNAL_SERVER_ERROR });
  }
});

export default maintenanceRouter;
