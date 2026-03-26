import { makeBike } from '../utils/test-data';
import { test as base, expect } from './auth-fixtures';

type GarageFixtures = {
  bikeInput: {
    make: string;
    model: string;
    year: string;
    odometer: string;
  };
  garageWithOneBike: {
    make: string;
    model: string;
    year: string;
    odometer: string;
  };
};

export const test = base.extend<GarageFixtures>({
  bikeInput: async ({}, use) => {
    const bike = makeBike();
    await use(bike);
  },

  garageWithOneBike: async ({ loggedInUser, garagePage }, use) => {
    const bike = makeBike();

    await garagePage.addBike(bike);
    await garagePage.expectBikeVisible(bike.make);

    await use(bike);
  },
});

export { expect };
