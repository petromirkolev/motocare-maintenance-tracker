export type MaintenanceItems = {
  name: 'oil-change' | 'coolant-change';
};

export type MaintenanceLog = {
  bike_id: string;
  name: MaintenanceItems;
  date: string;
  odo: number;
};

export type MaintenanceSchedule = {
  name: MaintenanceItems;
  interval_km: number;
  interval_days: number;
};

export type BikeUpdate = {
  id: string;
  make: string;
  model: string;
  year: number;
  odo: number;
};
