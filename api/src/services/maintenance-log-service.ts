import { v4 as uuidv4 } from 'uuid';
import { getAll, runQuery } from '../db-helpers';
import { MaintenanceLogRow } from '../types/maintenance-log';

export async function listMaintenanceLogsByBikeId(
  bikeId: string,
): Promise<MaintenanceLogRow[]> {
  return getAll<MaintenanceLogRow>(
    'SELECT * FROM maintenance_logs WHERE bike_id = ? ORDER BY date DESC, created_at DESC',
    [bikeId],
  );
}

export async function createMaintenanceLog(params: {
  bike_id: string;
  name: string;
  date: string;
  odo: number;
}): Promise<void> {
  await runQuery(
    `
      INSERT INTO maintenance_logs (
        id,
        bike_id,
        name,
        date,
        odo,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      uuidv4(),
      params.bike_id,
      params.name,
      params.date,
      params.odo,
      new Date().toISOString(),
    ],
  );
}
