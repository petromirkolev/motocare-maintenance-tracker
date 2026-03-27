import { test as base, expect } from './garage-fixtures';

type MaintenanceFixtures = {
  logInput: {
    doneAt: string;
    odo: string;
  };
  scheduleInput: {
    days: string;
    km: string;
  };
};

export const test = base.extend<MaintenanceFixtures>({
  logInput: async ({}, use) => {
    const input = {
      doneAt: '2026-03-16',
      odo: '1000',
    };

    await use(input);
  },
  scheduleInput: async ({}, use) => {
    const input = {
      days: '100',
      km: '1000',
    };
    await use(input);
  },
});

export { expect };
