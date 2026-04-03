export type MaintenanceItem = 'oil-change' | 'coolant-change';

export type MaintenanceLogInput = {
  name: MaintenanceItem;
  date: string;
  odo: number;
};

export type MaintenanceScheduleInput = {
  name: MaintenanceItem;
  interval_km: number;
  interval_days: number;
};

export type BikeUpdateInput = {
  id: string;
  make: string;
  model: string;
  year: number;
  odo: number;
};
