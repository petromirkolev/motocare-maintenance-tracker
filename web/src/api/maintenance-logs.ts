import { messages } from '../../../constants/messages';
import { API_BASE_URL } from './base';
import type {
  MaintenanceLog,
  CreateMaintenanceLogResponse,
  ListMaintenanceLogsResponse,
  MaintenanceLogErrorResponse,
} from '../types/index';

export async function fetchMaintenanceLogsByBikeId(
  bike_id: string,
): Promise<MaintenanceLog[]> {
  const response = await fetch(
    `${API_BASE_URL}/maintenance-logs?bike_id=${encodeURIComponent(bike_id)}`,
  );

  const data = (await response.json()) as
    | ListMaintenanceLogsResponse
    | MaintenanceLogErrorResponse;

  if (!response.ok) {
    throw new Error('error' in data ? data.error : messages.MAINT_LOGS_ERR);
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
    | MaintenanceLogErrorResponse;

  if (!response.ok) {
    throw new Error(
      'error' in data ? data.error : messages.MAINT_LOG_CREATE_ERR,
    );
  }

  return data as CreateMaintenanceLogResponse;
}
