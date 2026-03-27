import { expect, test } from '../fixtures/maintenance-fixtures';

test.describe('Maintenance history', () => {
  test('Maintenance history is empty when no maintenance logs are saved', async ({
    garageWithOneBike,
    maintenancePage,
  }) => {
    await maintenancePage.gotoMaintenance();

    await expect(maintenancePage.maintenanceHistoryContainer).toContainText(
      'No service history yet',
    );
  });

  test('New history log appears on maintenance log submit', async ({
    garageWithOneBike,
    logInput,
    maintenancePage,
  }) => {
    await maintenancePage.gotoMaintenance();

    await expect(maintenancePage.maintenanceHistoryContainer).toContainText(
      'No service history yet',
    );

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

    await expect(maintenancePage.maintenanceHistoryContainer).toContainText(
      'OIL CHANGE Done on March 16, 2026 at 1000 km.',
    );
  });

  test('History panel shows only the most recent maintenance log', async ({
    garageWithOneBike,
    logInput,
    maintenancePage,
  }) => {
    await maintenancePage.gotoMaintenance();

    await expect(maintenancePage.maintenanceHistoryContainer).toContainText(
      'No service history yet',
    );

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

    await maintenancePage.logMaintenance('coolant-change', '2026-03-17', '200');

    await maintenancePage.expectTaskFieldContains(
      'coolant-change',
      'last',
      'March 17, 2026 at 200 km.',
    );

    await expect(maintenancePage.maintenanceHistoryContainer).toContainText(
      'COOLANT CHANGE Done on March 17, 2026 at 200 km.',
    );

    await expect(maintenancePage.maintenanceHistoryContainer).not.toContainText(
      'OIL CHANGE Done on March 16, 2026 at 1000 km.',
    );
  });

  test('History log persists after refresh', async ({
    garageWithOneBike,
    logInput,
    maintenancePage,
  }) => {
    await maintenancePage.gotoMaintenance();

    await expect(maintenancePage.maintenanceHistoryContainer).toContainText(
      'No service history yet',
    );

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

    await expect(maintenancePage.maintenanceHistoryContainer).toContainText(
      'OIL CHANGE Done on March 16, 2026 at 1000 km.',
    );

    await maintenancePage.page.reload();

    await maintenancePage.gotoMaintenance();

    await expect(maintenancePage.maintenanceHistoryContainer).toContainText(
      'OIL CHANGE Done on March 16, 2026 at 1000 km.',
    );
  });

  test('History log of bike A does not appear in bike B', async ({
    garageWithOneBike,
    bikeInput,
    logInput,
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

    await expect(maintenancePage.maintenanceHistoryContainer).toContainText(
      'OIL CHANGE Done on March 16, 2026 at 1000 km.',
    );

    await maintenancePage.page.reload();

    const bike2Card = maintenancePage.getBikeCard(garageWithOneBike.make);

    await bike2Card.click();

    await expect(maintenancePage.maintenanceHistoryContainer).toContainText(
      'No service history yet',
    );
  });
});
