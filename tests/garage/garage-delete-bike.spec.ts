import { test } from '../fixtures/garage-fixtures';

test.describe('Garage delete bike', () => {
  test('Delete bike removes the selected bike', async ({
    garageWithOneBike,
    garagePage,
  }) => {
    await garagePage.deleteBikeByName(garageWithOneBike.make);
    await garagePage.expectBikeNotVisible(garageWithOneBike.make);
  });

  test('Deleting one bike keeps the other bikes visible', async ({
    garageWithOneBike,
    validBikeInput,
    garagePage,
  }) => {
    const bike2 = { ...validBikeInput, make: 'Honda', model: 'Rebel' };

    await garagePage.addBike(bike2);
    await garagePage.expectBikeVisible(bike2.make);

    await garagePage.deleteBikeByName(bike2.make);

    await garagePage.expectBikeNotVisible(bike2.make);
    await garagePage.expectBikeVisible(garageWithOneBike.make);
  });
});
