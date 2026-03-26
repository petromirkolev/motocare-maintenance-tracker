import { test } from '../fixtures/garage-fixtures';

test.describe('Garage create bike', () => {
  test.describe('Valid data', () => {
    test('Create bike with valid data', async ({
      loggedInUser,
      bikeInput,
      garagePage,
    }) => {
      await garagePage.addBike(bikeInput);
      await garagePage.expectBikeVisible(bikeInput.make);
    });

    test('Create bike with missing make and valid other fields', async ({
      loggedInUser,
      bikeInput,
      garagePage,
    }) => {
      await garagePage.addBike({ ...bikeInput, make: '' });
      await garagePage.expectError('Make is required');
      await garagePage.expectBikeNotVisible(bikeInput.make);
    });

    test('Create bike with missing model and valid other fields', async ({
      loggedInUser,
      bikeInput,
      garagePage,
    }) => {
      await garagePage.addBike({
        ...bikeInput,
        make: 'Yamaha',
        model: '',
      });
      await garagePage.expectError('Model is required');
      await garagePage.expectBikeNotVisible('Yamaha');
    });

    test('Create bike with missing year and valid other fields', async ({
      loggedInUser,
      bikeInput,
      garagePage,
    }) => {
      await garagePage.addBike({
        ...bikeInput,
        make: 'Yamaha',
        year: '',
      });
      await garagePage.expectError('Year is required');
      await garagePage.expectBikeNotVisible('Yamaha');
    });

    test('Create bike with empty odo when odo is optional', async ({
      loggedInUser,
      bikeInput,
      garagePage,
    }) => {
      await garagePage.addBike({
        ...bikeInput,
        make: 'Yamaha',
        odometer: '',
      });
      await garagePage.expectBikeVisible('Yamaha');
    });
  });

  test.describe('Invalid data', () => {
    test('Create bike with missing all fields', async ({
      loggedInUser,
      bikeInput,
      garagePage,
    }) => {
      await garagePage.addBike({
        ...bikeInput,
        make: '',
        model: '',
        year: '',
        odometer: '',
      });
      await garagePage.expectError('Make is required');
      await garagePage.expectBikeNotVisible(bikeInput.make);
    });

    test('Create bike with invalid year < 1900', async ({
      loggedInUser,
      bikeInput,
      garagePage,
    }) => {
      await garagePage.addBike({ ...bikeInput, year: '1899' });
      await garagePage.expectError('Invalid year');
      await garagePage.expectBikeNotVisible(bikeInput.make);
    });

    test('Create bike with invalid year > 2100', async ({
      loggedInUser,
      bikeInput,
      garagePage,
    }) => {
      await garagePage.addBike({ ...bikeInput, year: '2101' });
      await garagePage.expectError('Invalid year');
      await garagePage.expectBikeNotVisible(bikeInput.make);
    });

    test('Create bike with negative odometer', async ({
      loggedInUser,
      bikeInput,
      garagePage,
    }) => {
      await garagePage.addBike({
        ...bikeInput,
        odometer: '-100',
      });
      await garagePage.expectError('Invalid odo');
      await garagePage.expectBikeNotVisible(bikeInput.make);
    });
  });
});
