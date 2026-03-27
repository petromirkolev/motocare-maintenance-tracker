import { test } from '../fixtures/maintenance-fixtures';

test.describe('Maintenance logs', () => {
  test('Maintenance log modal is opening', async ({
    garageWithOneBike,
    maintenancePage,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.openMaintenanceLogModal('oil-change');
  });

  test('Maintenance log with valid date and odometer saves and shows in UI', async ({
    garageWithOneBike,
    maintenancePage,
    logInput,
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
  });

  test('Canceling maintenance log does not change UI', async ({
    garageWithOneBike,
    maintenancePage,
    logInput,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.openMaintenanceLogModal('oil-change');

    await maintenancePage.fillMaintenanceLog(logInput.doneAt, logInput.odo);

    await maintenancePage.cancelMaintenanceLog();

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'Never logged',
    );
  });

  test('Maintenance log negative odo is rejected', async ({
    garageWithOneBike,
    maintenancePage,
    logInput,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.logMaintenance(
      'coolant-change',
      logInput.doneAt,
      '-100',
    );

    await maintenancePage.expectLogError('Odo must be a positive number');
  });

  test('Page reload preserves maintenance logs', async ({
    garageWithOneBike,
    maintenancePage,
    logInput,
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

    await maintenancePage.page.reload();

    await maintenancePage.gotoMaintenance();

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 1000 km.',
    );
  });

  test('Newer maintenance log replaces current maintenance log', async ({
    garageWithOneBike,
    maintenancePage,
    logInput,
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

    await maintenancePage.page.reload();

    await maintenancePage.gotoMaintenance();

    await maintenancePage.logMaintenance('oil-change', '2026-03-17', '200');

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 17, 2026 at 200 km.',
    );
  });

  test('Logging one maintenance item does not affect another maintenance item', async ({
    garageWithOneBike,
    maintenancePage,
    logInput,
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

    await maintenancePage.logMaintenance('coolant-change', '2026-03-18', '300');

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 1000 km.',
    );
    await maintenancePage.expectTaskFieldContains(
      'coolant-change',
      'last',
      'March 18, 2026 at 300 km.',
    );
  });

  test('Logging maintenance for bike A does not affect bike B', async ({
    garageWithOneBike,
    garagePage,
    maintenancePage,
    logInput,
    bikeInput,
  }) => {
    await garagePage.addBike(bikeInput);

    await garagePage.expectBikeVisible(bikeInput.make);

    const bikeCard = maintenancePage.getBikeCard(bikeInput.make);

    await bikeCard.click();

    await maintenancePage.logMaintenance('oil-change', '2026-03-16', '100');

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 100 km.',
    );

    await maintenancePage.page.reload();

    const bike2Card = maintenancePage.getBikeCard(garageWithOneBike.make);

    await bike2Card.click();

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'Never logged',
    );
  });
});
