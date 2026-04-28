export type Maintenance = {
  id: string;
  bike_id: string;
  name: string;
  date: string | null;
  odo: number | null;
  interval_km: number | null;
  interval_days: number | null;
  created_at: string;
};

export type MaintenanceLogInput = {
  date: string | null;
  odo: number | null;
};

export type MaintenanceScheduleInput = {
  interval_days: string | null;
  interval_km: number | null;
};

export type ListMaintenanceResponse = {
  maintenance: Maintenance[];
};

export type LogMaintenanceResponse = {
  message: string;
};

export type ScheduleMaintenanceResponse = {
  message: string;
};

export type MaintenanceErrorResponse = {
  error: string;
};
