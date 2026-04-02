import { test as base, expect, request } from '@playwright/test';
import {
  invalidInput,
  makeBike,
  uniqueEmail,
  validInput,
} from '../utils/test-data';
import { api } from '../utils/api-helpers';

type ApiFixtures = {
  validUserInput: {
    email: string;
    password: string;
  };

  invalidUserInput: {
    email: string;
    password: string;
    shortPassword: string;
    longPassword: string;
  };

  validBikeInput: {
    make: string;
    model: string;
    year: number;
    odo: number;
  };

  validBikeUpdateInput: {
    make: string;
    model: string;
    odo: number;
    year: number;
  };

  invalidBikeInput: {
    yearBelow: number;
    yearAbove: number;
    odo: number;
  };

  registeredUser: {
    email: string;
    password: string;
  };

  loggedInUser: {
    email: string;
    password: string;
    user_id: string;
  };

  userWithOneBike: {
    email: string;
    password: string;
    user_id: string;
    bike_id: string;
  };
};

export const test = base.extend<ApiFixtures>({
  validUserInput: async ({}, use) => {
    const email = uniqueEmail();
    const password = validInput.password;

    await use({ email, password });
  },

  invalidUserInput: async ({}, use) => {
    const email = invalidInput.email;
    const password = invalidInput.password;
    const shortPassword = invalidInput.shortPassword;
    const longPassword = invalidInput.longPassword;

    await use({ email, password, shortPassword, longPassword });
  },

  validBikeInput: async ({}, use) => {
    const { make, model, year, odo } = makeBike();

    await use({ make, model, year, odo });
  },

  validBikeUpdateInput: async ({}, use) => {
    const make = 'Honda';
    const model = 'Rebel';
    const odo = 1000;
    const year = 2010;

    await use({ make, model, odo, year });
  },

  invalidBikeInput: async ({}, use) => {
    const yearBelow = 1899;
    const yearAbove = 2101;
    const odo = -100;

    await use({ yearBelow, yearAbove, odo });
  },

  registeredUser: async ({ request, validUserInput }, use) => {
    await api.registerUser(request, { ...validUserInput });

    await use({ ...validUserInput });
  },

  loggedInUser: async ({ request, registeredUser }, use) => {
    const response = await api.loginUser(request, { ...registeredUser });
    const body = await response.json();
    const user_id = body.user.id;

    await use({ ...registeredUser, user_id });
  },

  userWithOneBike: async ({ request, loggedInUser, validBikeInput }, use) => {
    const response = await api.createBike(request, loggedInUser.user_id, {
      ...validBikeInput,
    });
    const body = await response.json();
    const bike_id = body.bike.id;

    await use({ ...loggedInUser, bike_id });
  },
});

export { expect };
