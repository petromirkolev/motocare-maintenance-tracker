import { test } from '../fixtures/maintenance-fixtures';
import { makeBike } from '../utils/test-data';

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

    await maintenancePage.logMaintenance(logInput);

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 1000 km.',
    );

    await maintenancePage.expectStatusCounts('1', '0', '0');

    await maintenancePage.logMaintenance({
      ...logInput,
      service: 'coolant-change',
    });

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
    scheduleInput,
    maintenancePage,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.logMaintenance(logInput);

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 1000 km.',
    );

    await maintenancePage.expectStatusCounts('1', '0', '0');

    await maintenancePage.scheduleMaintenance({
      ...scheduleInput,
      interval_km: 200,
    });

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'due',
      'June 24, 2026 or at 1200 km.',
    );
    await maintenancePage.expectStatusCounts('1', '1', '0');
  });

  test('Item becomes Due Soon by days', async ({
    garageWithOneBike,
    logInput,
    scheduleInput,
    maintenancePage,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.logMaintenance(logInput);

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 1000 km.',
    );

    await maintenancePage.expectStatusCounts('1', '0', '0');

    await maintenancePage.scheduleMaintenance({
      ...scheduleInput,
      interval_days: 20,
    });

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
    scheduleInput,
    maintenancePage,
    garagePage,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.logMaintenance(logInput);

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 1000 km.',
    );

    await maintenancePage.expectStatusCounts('1', '0', '0');

    await maintenancePage.scheduleMaintenance(scheduleInput);

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'due',
      'June 24, 2026 or at 2000 km.',
    );
    await maintenancePage.expectStatusCounts('1', '0', '0');

    await maintenancePage.backToGarageButton.click();

    await garagePage.editBike({ ...garageWithOneBike, odo: 2100 });

    await garagePage.expectBikeVisible(garageWithOneBike.make);

    await maintenancePage.gotoMaintenance();

    await maintenancePage.expectStatusCounts('0', '0', '1');
  });

  test('Item becomes Overdue by days', async ({
    garageWithOneBike,
    logInput,
    scheduleInput,
    maintenancePage,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.logMaintenance(logInput);

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 1000 km.',
    );

    await maintenancePage.scheduleMaintenance({
      ...scheduleInput,
      interval_days: 10,
    });

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'due',
      'March 26, 2026 or at 2000 km.',
    );

    await maintenancePage.expectStatusCounts('0', '0', '1');
  });

  test('Bike A On Track/Due Soon/Overdue stats do not affect bike B', async ({
    garageWithOneBike,
    logInput,
    scheduleInput,
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
    await maintenancePage.expectStatusCounts('1', '0', '0');

    await maintenancePage.page.reload();

    await maintenancePage.getBikeCard(garageWithOneBike.make).click();

    await maintenancePage.expectStatusCounts('0', '0', '0');
  });
});
