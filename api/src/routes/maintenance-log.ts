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
    res.status(400).json({ error: msg.PARAM_BIKE_ID });
    return;
  }

  try {
    const logs = await listMaintenanceLogsByBikeId(bike_id);
    res.json({ logs });
  } catch (error) {
    console.error(msg.MAINT_LOG_LIST_FAIL, error);
    res.status(500).json({ error: msg.SYS_ERR_INTERNAL });
  }
});

maintenanceLogsRouter.post('/', async (req, res) => {
  const body = (req.body ?? {}) as CreateMaintenanceLogBody;

  const bike_id = normalizeString(body.bike_id);
  const name = normalizeString(body.name);
  const { date, odo } = body;

  if (!bike_id || !name || !date || odo === undefined) {
    res.status(400).json({ error: msg.PARAM_MAINT_LOG });
    return;
  }

  if (!isValidIsoLikeDate(date)) {
    res.status(400).json({ error: msg.MAINT_DATE_INVALID });
    return;
  }

  if (!isNonNegativeInteger(odo)) {
    res.status(400).json({ error: msg.PARAM_ODO_NON_NEG });
    return;
  }

  try {
    await createMaintenanceLog({
      bike_id,
      name: name.trim(),
      date,
      odo: Number(odo),
    });

    res.status(201).json({ message: msg.MAINT_LOG_CREATE_OK });
  } catch (error) {
    console.error(msg.MAINT_LOG_CREATE_FAIL, error);
    res.status(500).json({ error: msg.SYS_ERR_INTERNAL });
  }
});

export default maintenanceLogsRouter;
