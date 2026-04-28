import { messages } from '../../../constants/messages';
import { API_BASE_URL } from './base';
import type {
  Maintenance,
  LogMaintenanceResponse,
  ScheduleMaintenanceResponse,
  ListMaintenanceResponse,
  MaintenanceErrorResponse,
} from '../types/index';

export async function fetchMaintenanceByBikeId(
  bike_id: string,
): Promise<Maintenance[]> {
  const response = await fetch(
    `${API_BASE_URL}/maintenance?bike_id=${encodeURIComponent(bike_id)}`,
  );

  const data = (await response.json()) as
    | ListMaintenanceResponse
    | MaintenanceErrorResponse;

  if (!response.ok) {
    throw new Error('error' in data ? data.error : messages.MAINT_FETCH_ERR);
  }

  return (data as ListMaintenanceResponse).maintenance;
}

export async function logMaintenanceApi(input: {
  bike_id: string;
  name: string;
  date: string | null;
  odo: number | null;
  interval_km: number | null;
  interval_days: number | null;
}): Promise<LogMaintenanceResponse> {
  const response = await fetch(`${API_BASE_URL}/maintenance/log`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as
    | LogMaintenanceResponse
    | MaintenanceErrorResponse;

  if (!response.ok) {
    throw new Error(
      'error' in data ? data.error : messages.MAINT_LOG_CREATE_ERR,
    );
  }

  return data as LogMaintenanceResponse;
}

export async function scheduleMaintenanceApi(input: {
  bike_id: string;
  name: string;
  date: string | null;
  odo: number | null;
  interval_km: number | null;
  interval_days: number | null;
}): Promise<ScheduleMaintenanceResponse> {
  const response = await fetch(`${API_BASE_URL}/maintenance/schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as
    | ScheduleMaintenanceResponse
    | MaintenanceErrorResponse;

  if (!response.ok) {
    throw new Error('error' in data ? data.error : messages.MAINT_UPDATE_FAIL);
  }

  return data as ScheduleMaintenanceResponse;
}
