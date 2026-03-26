import { test } from '../fixtures/garage-fixtures';

test.describe('Garage empty state', () => {
  test('Garage shows empty state when no bikes are added', async ({
    loggedInUser,
    garagePage,
  }) => {
    await garagePage.expectGarageEmpty();
  });

  test('Garage shows empty state when all bikes are deleted', async ({
    loggedInUser,
    bikeInput,
    garagePage,
  }) => {
    await garagePage.addBike(bikeInput);
    await garagePage.expectBikeVisible(bikeInput.make);
    await garagePage.deleteBikeByName(bikeInput.make);
    await garagePage.expectBikeNotVisible(bikeInput.make);
    await garagePage.expectGarageEmpty();
  });
});
