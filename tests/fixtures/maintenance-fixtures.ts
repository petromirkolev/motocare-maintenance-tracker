import {
  MaintenanceLogInput,
  MaintenanceScheduleInput,
} from '../types/maintenance';
import { test as base, expect } from './garage-fixtures';

type MaintenanceFixtures = {
  logInput: MaintenanceLogInput;
  scheduleInput: MaintenanceScheduleInput;
};

export const test = base.extend<MaintenanceFixtures>({
  logInput: async ({}, use) => {
    await use({ name: 'oil-change', date: '2026-03-16', odo: 1000 });
  },
  scheduleInput: async ({}, use) => {
    await use({ name: 'oil-change', interval_days: 100, interval_km: 1000 });
  },
});

export { expect };
