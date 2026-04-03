export type MaintenanceItem = 'oil-change' | 'coolant-change';

export type MaintenanceLogInput = {
  service: MaintenanceItem;
  doneAt: string;
  odo: number;
};

export type MaintenanceScheduleInput = {
  service: MaintenanceItem;
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
