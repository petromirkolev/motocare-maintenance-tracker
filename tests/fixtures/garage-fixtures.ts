import { req } from '../../web/src/utils/dom-helper';
import { InvalidBikeInput, ValidBikeInput } from '../types/bike';
import { api } from '../utils/api-helpers';
import { makeBike } from '../utils/test-data';
import { test as base, expect } from './auth-fixtures';

type GarageFixtures = {
  validBikeInput: ValidBikeInput;
  invalidBikeInput: InvalidBikeInput;
  garageWithOneBike: ValidBikeInput;
};

export const test = base.extend<GarageFixtures>({
  validBikeInput: async ({}, use) => {
    await use(makeBike());
  },

  invalidBikeInput: async ({}, use) => {
    await use({ yearAbove: 2101, yearBelow: 1899, odo: -100 });
  },

  garageWithOneBike: async (
    { validBikeInput, loggedInUser, garagePage },
    use,
  ) => {
    await garagePage.addBike(validBikeInput);
    await garagePage.expectBikeVisible(validBikeInput.make);

    await use(validBikeInput);
  },
});

export { expect };
