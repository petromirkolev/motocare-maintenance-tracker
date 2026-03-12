export type MaintenanceRow = {
  id: string;
  bike_id: string;
  name: string;
  date: string | null;
  odo: number | null;
  interval_km: number | null;
  interval_days: number | null;
  created_at: string;
};

export type UpsertMaintenanceBody = {
  bikeId?: string;
  name?: string;
  date?: string | null;
  odo?: number | null;
  intervalKm?: number | null;
  intervalDays?: number | null;
};
