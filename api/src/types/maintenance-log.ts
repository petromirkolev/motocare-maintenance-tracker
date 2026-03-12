export type MaintenanceLogRow = {
  id: string;
  bike_id: string;
  name: string;
  date: string;
  odo: number;
  created_at: string;
};

export type CreateMaintenanceLogBody = {
  bike_id?: string;
  name?: string;
  date?: string;
  odo?: number;
};
