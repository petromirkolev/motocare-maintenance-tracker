import type {
  MaintenanceLog,
  CreateMaintenanceLogResponse,
  ListMaintenanceLogsResponse,
  ErrorResponse,
} from '../types/maintenance-log';
import { API_BASE_URL } from './base';

export async function fetchMaintenanceLogsByBikeId(
  bike_id: string,
): Promise<MaintenanceLog[]> {
  const response = await fetch(
    `${API_BASE_URL}/maintenance-logs?bike_id=${encodeURIComponent(bike_id)}`,
  );

  const data = (await response.json()) as
    | ListMaintenanceLogsResponse
    | ErrorResponse;

  if (!response.ok) {
    throw new Error(
      'error' in data ? data.error : 'Failed to fetch maintenance logs',
    );
  }

  return (data as ListMaintenanceLogsResponse).logs;
}

export async function createMaintenanceLogApi(input: {
  bike_id: string;
  name: string;
  date: string | null;
  odo: number;
}): Promise<CreateMaintenanceLogResponse> {
  const response = await fetch(`${API_BASE_URL}/maintenance-logs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as
    | CreateMaintenanceLogResponse
    | ErrorResponse;

  if (!response.ok) {
    throw new Error(
      'error' in data ? data.error : 'Failed to create maintenance log',
    );
  }

  return data as CreateMaintenanceLogResponse;
}
