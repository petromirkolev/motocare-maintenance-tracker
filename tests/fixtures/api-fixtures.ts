import { test as base, expect } from '@playwright/test';
import {
  invalidInput,
  makeBike,
  uniqueEmail,
  validInput,
} from '../utils/test-data';
import { api } from '../utils/api-helpers';
import { ValidBikeInput } from '../types/bike';
import { InvalidUserInput, ValidUserInput } from '../types/auth';
import {
  MaintenanceLogInput,
  MaintenanceScheduleInput,
} from '../types/maintenance';

type InvalidBikeInput = {
  yearBelow: number;
  yearAbove: number;
  odo: number;
};

type LoggedInUser = ValidUserInput & {
  user_id: string;
};

type UserWithOneBike = LoggedInUser & {
  bike_id: string;
};

type ApiFixtures = {
  validUserInput: ValidUserInput;
  invalidUserInput: InvalidUserInput;
  validBikeInput: ValidBikeInput;
  validBikeUpdateInput: ValidBikeInput;
  invalidBikeInput: InvalidBikeInput;
  maintenanceLogInput: MaintenanceLogInput;
  maintenanceScheduleInput: MaintenanceScheduleInput;
  registeredUser: ValidUserInput;
  loggedInUser: LoggedInUser;
  userWithOneBike: UserWithOneBike;
};

export const test = base.extend<ApiFixtures>({
  validUserInput: async ({}, use) => {
    await use({ email: uniqueEmail(), password: validInput.password });
  },

  invalidUserInput: async ({}, use) => {
    await use({
      email: invalidInput.email,
      password: invalidInput.password,
      shortPassword: invalidInput.shortPassword,
      longPassword: invalidInput.longPassword,
    });
  },

  validBikeInput: async ({}, use) => {
    await use({ ...makeBike() });
  },

  validBikeUpdateInput: async ({}, use) => {
    await use({ make: 'Honda', model: 'Rebel', odo: 1000, year: 2010 });
  },

  invalidBikeInput: async ({}, use) => {
    await use({ yearBelow: 1899, yearAbove: 2101, odo: -100 });
  },

  maintenanceLogInput: async ({}, use) => {
    await use({
      name: 'oil-change',
      date: '2026-04-02',
      odo: 12000,
    });
  },

  maintenanceScheduleInput: async ({}, use) => {
    await use({ name: 'oil-change', interval_days: 100, interval_km: 1000 });
  },

  registeredUser: async ({ request, validUserInput }, use) => {
    await api.registerUser(request, validUserInput);

    await use(validUserInput);
  },

  loggedInUser: async ({ request, registeredUser }, use) => {
    const response = await api.loginUser(request, registeredUser);
    const body = await response.json();

    await use({ ...registeredUser, user_id: body.user.id });
  },

  userWithOneBike: async ({ request, loggedInUser, validBikeInput }, use) => {
    const response = await api.createBike(
      request,
      loggedInUser.user_id,
      validBikeInput,
    );
    const body = await response.json();

    await use({ ...loggedInUser, bike_id: body.bike.id });
  },
});

export { expect };
