import { msg } from '../../constants/constants';
import { test, expect } from '../fixtures/garage-fixtures';

test.describe('Garage edit bike', () => {
  test('Edit bike with valid data updates the bike', async ({
    garageWithOneBike,
    validBikeInput,
    garagePage,
  }) => {
    await garagePage.editBike({ ...validBikeInput, make: 'Honda' });

    await expect(garagePage.garageGrid).toBeVisible();
    await expect(garagePage.editBikeScreen).not.toBeVisible();

    await garagePage.expectBikeVisible('Honda');
    await garagePage.expectBikeNotVisible(garageWithOneBike.make);
  });

  test('Cancel edit bike does not change bike data', async ({
    garageWithOneBike,
    garagePage,
  }) => {
    await garagePage.openEditBike();
    await garagePage.editBikeMake.fill('Yamaha');

    await garagePage.cancelEditBike();

    await expect(garagePage.garageGrid).toBeVisible();
    await expect(garagePage.editBikeScreen).not.toBeVisible();

    await garagePage.expectBikeVisible(garageWithOneBike.make);
    await garagePage.expectBikeNotVisible('Yamaha');
  });

  test('Edit bike with invalid year < 1900 renders an error message', async ({
    garageWithOneBike,
    invalidBikeInput,
    garagePage,
  }) => {
    await garagePage.editBike({
      ...garageWithOneBike,
      year: invalidBikeInput.yearBelow,
    });
    await garagePage.expectEditError(msg.BIKE_YEAR_RANGE);

    await garagePage.cancelEditBike();

    await expect(garagePage.garageGrid).toContainText(
      String(garageWithOneBike.year),
    );
  });

  test('Edit bike with invalid year > 2100 renders an error message', async ({
    garageWithOneBike,
    invalidBikeInput,
    garagePage,
  }) => {
    await garagePage.editBike({
      ...garageWithOneBike,
      year: invalidBikeInput.yearAbove,
    });
    await garagePage.expectEditError(msg.BIKE_YEAR_RANGE);

    await garagePage.cancelEditBike();

    await expect(garagePage.garageGrid).toContainText(
      String(garageWithOneBike.year),
    );
  });

  test('Edit bike with decreasing odometer renders an error message', async ({
    garageWithOneBike,
    garagePage,
  }) => {
    await garagePage.editBike({
      ...garageWithOneBike,
      odo: garageWithOneBike.odo - 100,
    });
    await garagePage.expectEditError(msg.BIKE_ODO_DECR);

    await garagePage.cancelEditBike();

    await expect(garagePage.garageGrid).toContainText(
      String(garageWithOneBike.odo),
    );
  });

  test('Editing only bike make keeps other bike fields unchanged', async ({
    garageWithOneBike,
    garagePage,
  }) => {
    await garagePage.editBike({ ...garageWithOneBike, make: 'Updated make' });

    await garagePage.expectBikeVisible(garageWithOneBike.make);

    await expect(garagePage.garageGrid).toContainText('Updated make');
    await expect(garagePage.garageGrid).toContainText(garageWithOneBike.model);
    await expect(garagePage.garageGrid).toContainText(
      String(garageWithOneBike.year),
    );
    await expect(garagePage.garageGrid).toContainText(
      String(garageWithOneBike.odo),
    );
  });

  test('Editing only bike model keeps other bike fields unchanged', async ({
    garageWithOneBike,
    garagePage,
  }) => {
    await garagePage.editBike({ ...garageWithOneBike, model: 'Updated model' });

    await garagePage.expectBikeVisible(garageWithOneBike.make);

    await expect(garagePage.garageGrid).toContainText('Updated model');
    await expect(garagePage.garageGrid).toContainText(
      String(garageWithOneBike.year),
    );
    await expect(garagePage.garageGrid).toContainText(
      String(garageWithOneBike.odo),
    );
  });

  test('Edit bike with missing make is rejected', async ({
    garageWithOneBike,
    garagePage,
  }) => {
    await garagePage.editBike({ ...garageWithOneBike, make: '' });
    await garagePage.expectEditError(msg.BIKE_MAKE_REQ);

    await garagePage.cancelEditBike();

    await garagePage.expectBikeVisible(garageWithOneBike.make);
  });

  test('Edit bike with missing model is rejected', async ({
    garageWithOneBike,
    garagePage,
  }) => {
    await garagePage.editBike({ ...garageWithOneBike, model: '' });
    await garagePage.expectEditError(msg.BIKE_MODEL_REQ);

    await garagePage.cancelEditBike();

    await garagePage.expectBikeVisible(garageWithOneBike.make);
  });

  test('Edit bike with missing year is rejected', async ({
    garageWithOneBike,
    garagePage,
  }) => {
    await garagePage.editBike({ ...garageWithOneBike, year: Number('') });
    await garagePage.expectEditError(msg.BIKE_YEAR_REQ);

    await garagePage.cancelEditBike();

    await garagePage.expectBikeVisible(garageWithOneBike.make);
  });

  test('Edit bike with missing odometer is rejected', async ({
    garageWithOneBike,
    garagePage,
  }) => {
    await garagePage.editBike({ ...garageWithOneBike, odo: Number('') });
    await garagePage.expectEditError(msg.BIKE_ODO_REQ);

    await garagePage.cancelEditBike();

    await expect(garagePage.garageGrid).toContainText(
      String(garageWithOneBike.odo),
    );
  });
});
