import { expect, test } from '../fixtures/maintenance-fixtures';
import { makeBike } from '../utils/test-data';

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

    await maintenancePage.logMaintenance(logInput);

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

    await maintenancePage.logMaintenance(logInput);

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 1000 km.',
    );

    await maintenancePage.logMaintenance({
      service: 'coolant-change',
      doneAt: '2026-03-17',
      odo: 200,
    });

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

    await maintenancePage.logMaintenance(logInput);

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
    logInput,
    maintenancePage,
    garagePage,
  }) => {
    const bike = makeBike();
    await garagePage.addBike(bike);
    await garagePage.expectBikeVisible(bike.make);

    await maintenancePage.getBikeCard(bike.make).click();

    await maintenancePage.logMaintenance(logInput);

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 1000 km.',
    );

    await expect(maintenancePage.maintenanceHistoryContainer).toContainText(
      'OIL CHANGE Done on March 16, 2026 at 1000 km.',
    );

    await maintenancePage.page.reload();

    await maintenancePage.getBikeCard(garageWithOneBike.make).click();

    await expect(maintenancePage.maintenanceHistoryContainer).toContainText(
      'No service history yet',
    );
  });
});
