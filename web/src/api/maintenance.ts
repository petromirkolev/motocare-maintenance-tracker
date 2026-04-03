import {
  FAIL_FETCH_MAINTENANCE,
  FAIL_LOG_MAINTENANCE,
  FAIL_UPSERT_MAINTENANCE,
} from '../../../constants/constants';
import type {
  Maintenance,
  LogMaintenanceResponse,
  ScheduleMaintenanceResponse,
  ListMaintenanceResponse,
  ErrorResponse,
} from '../types/maintenance';
import { API_BASE_URL } from './base';

export async function fetchMaintenanceByBikeId(
  bike_id: string,
): Promise<Maintenance[]> {
  const response = await fetch(
    `${API_BASE_URL}/maintenance?bike_id=${encodeURIComponent(bike_id)}`,
  );

  const data = (await response.json()) as
    | ListMaintenanceResponse
    | ErrorResponse;

  if (!response.ok) {
    throw new Error('error' in data ? data.error : FAIL_FETCH_MAINTENANCE);
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
    | ErrorResponse;

  if (!response.ok) {
    throw new Error('error' in data ? data.error : FAIL_LOG_MAINTENANCE);
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
    | ErrorResponse;

  if (!response.ok) {
    throw new Error('error' in data ? data.error : FAIL_UPSERT_MAINTENANCE);
  }

  return data as ScheduleMaintenanceResponse;
}
