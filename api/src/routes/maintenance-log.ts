import { Router } from 'express';
import { msg } from '../constants/constants';
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
    res.status(400).json({ error: msg.BIKE_PARAM });
    return;
  }

  try {
    const logs = await listMaintenanceLogsByBikeId(bike_id);
    res.json({ logs });
  } catch (error) {
    console.error(msg.MAINTENANCE_LOG_LIST_FAIL, error);
    res.status(500).json({ error: msg.INTERNAL_SERVER_ERROR });
  }
});

maintenanceLogsRouter.post('/', async (req, res) => {
  const body = (req.body ?? {}) as CreateMaintenanceLogBody;

  const bike_id = normalizeString(body.bike_id);
  const name = normalizeString(body.name);
  const { date, odo } = body;

  if (!bike_id || !name || !date || odo === undefined) {
    res.status(400).json({ error: msg.MAINTENANCE_LOG_PARAMS });
    return;
  }

  if (!isValidIsoLikeDate(date)) {
    res.status(400).json({ error: msg.INVALID_DATE });
    return;
  }

  if (!isNonNegativeInteger(odo)) {
    res.status(400).json({ error: msg.ODO_NON_NEG });
    return;
  }

  try {
    await createMaintenanceLog({
      bike_id,
      name: name.trim(),
      date,
      odo: Number(odo),
    });

    res.status(201).json({ message: msg.MAINTENANCE_LOG_CREATE_SUCCESS });
  } catch (error) {
    console.error(msg.MAINTENANCE_LOG_CREATE_FAIL, error);
    res.status(500).json({ error: msg.INTERNAL_SERVER_ERROR });
  }
});

export default maintenanceLogsRouter;
