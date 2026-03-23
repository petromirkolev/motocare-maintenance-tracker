export type MaintenanceLog = {
  id: string;
  bike_id: string;
  name: string;
  date: string | null;
  odo: number | null;
  interval_km: number | null;
  interval_days: number | null;
  created_at: string;
};

export type ListMaintenanceLogsResponse = {
  logs: MaintenanceLog[];
};

export type CreateMaintenanceLogResponse = {
  message: string;
};

export type ErrorResponse = {
  error: string;
};
