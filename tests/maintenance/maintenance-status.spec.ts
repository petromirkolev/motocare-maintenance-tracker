import { test, expect } from '../fixtures/maintenance-fixtures';

test.describe('Maintenance status', () => {
  test('Maintenance status counts are zero when no maintenance logs are present', async ({
    garageWithOneBike,
    maintenancePage,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.expectStatusCounts('0', '0', '0');
  });

  test('New maintenance logs update the On Track badge', async ({
    garageWithOneBike,
    logInput,
    maintenancePage,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.logMaintenance(
      'oil-change',
      logInput.doneAt,
      logInput.odo,
    );

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 1000 km.',
    );

    await maintenancePage.expectStatusCounts('1', '0', '0');

    await maintenancePage.logMaintenance(
      'coolant-change',
      logInput.doneAt,
      logInput.odo,
    );

    await maintenancePage.expectTaskFieldContains(
      'coolant-change',
      'last',
      'March 16, 2026 at 1000 km.',
    );
    await maintenancePage.expectStatusCounts('2', '0', '0');
  });

  test('Item becomes Due Soon by kilometers', async ({
    garageWithOneBike,
    logInput,
    maintenancePage,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.logMaintenance(
      'oil-change',
      logInput.doneAt,
      logInput.odo,
    );

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 1000 km.',
    );

    await maintenancePage.expectStatusCounts('1', '0', '0');

    await maintenancePage.scheduleMaintenance('oil-change', '100', '500');

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'due',
      'June 24, 2026 or at 1500 km.',
    );
    await maintenancePage.expectStatusCounts('1', '1', '0');
  });

  test('Item becomes Due Soon by days', async ({
    garageWithOneBike,
    logInput,
    maintenancePage,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.logMaintenance(
      'oil-change',
      logInput.doneAt,
      logInput.odo,
    );

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 1000 km.',
    );

    await maintenancePage.expectStatusCounts('1', '0', '0');

    await maintenancePage.scheduleMaintenance('oil-change', '20', '1000');

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'due',
      'April 5, 2026 or at 2000 km.',
    );
    await maintenancePage.expectStatusCounts('1', '1', '0');
  });

  test('Item becomes Overdue by kilometers', async ({
    garageWithOneBike,
    logInput,
    maintenancePage,
    garagePage,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.logMaintenance(
      'oil-change',
      logInput.doneAt,
      logInput.odo,
    );
    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 1000 km.',
    );

    await maintenancePage.expectStatusCounts('1', '0', '0');

    await maintenancePage.scheduleMaintenance('oil-change', '100', '1000');

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'due',
      'June 24, 2026 or at 2000 km.',
    );
    await maintenancePage.expectStatusCounts('1', '0', '0');

    await maintenancePage.backToGarageButton.click();

    await garagePage.editBike({ ...garageWithOneBike, odometer: '2100' });

    await garagePage.expectBikeVisible(garageWithOneBike.make);

    await maintenancePage.gotoMaintenance();

    await maintenancePage.expectStatusCounts('0', '0', '1');
  });

  test('Item becomes Overdue by days', async ({
    garageWithOneBike,
    logInput,
    maintenancePage,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.logMaintenance(
      'oil-change',
      '2026-02-16',
      logInput.odo,
    );

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'February 16, 2026 at 1000 km.',
    );

    await maintenancePage.scheduleMaintenance('oil-change', '10', '1000');

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'due',
      'February 26, 2026 or at 2000 km.',
    );

    await maintenancePage.expectStatusCounts('0', '0', '1');
  });

  test('Bike A On Track/Due Soon/Overdue stats do not affect bike B', async ({
    garageWithOneBike,
    bikeInput,
    logInput,
    scheduleInput,
    maintenancePage,
    garagePage,
  }) => {
    await garagePage.addBike(bikeInput);

    await garagePage.expectBikeVisible(bikeInput.make);

    const bikeCard = maintenancePage.getBikeCard(bikeInput.make);

    await bikeCard.click();

    await maintenancePage.logMaintenance(
      'oil-change',
      logInput.doneAt,
      logInput.odo,
    );

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 1000 km.',
    );
    await maintenancePage.expectStatusCounts('1', '0', '0');

    await maintenancePage.scheduleMaintenance('oil-change', '20', '1000');

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'due',
      'April 5, 2026 or at 2000 km.',
    );
    await maintenancePage.expectStatusCounts('1', '1', '0');

    await maintenancePage.page.reload();

    const bike2Card = maintenancePage.getBikeCard(garageWithOneBike.make);

    await bike2Card.click();

    await maintenancePage.expectStatusCounts('0', '0', '0');
  });
});
