import { msg } from '../../constants/constants';
import { test } from '../fixtures/maintenance-fixtures';
import { makeBike } from '../utils/test-data';

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

    await maintenancePage.logMaintenance(logInput);
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

    await maintenancePage.fillMaintenanceLog(logInput);

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

    await maintenancePage.logMaintenance({ ...logInput, odo: -100 });

    await maintenancePage.expectLogError(msg.BIKE_ODO_POS);
  });

  test('Page reload preserves maintenance logs', async ({
    garageWithOneBike,
    maintenancePage,
    logInput,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.logMaintenance(logInput);
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

    await maintenancePage.logMaintenance(logInput);
    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 1000 km.',
    );

    await maintenancePage.page.reload();

    await maintenancePage.gotoMaintenance();

    await maintenancePage.logMaintenance({
      service: 'oil-change',
      doneAt: '2026-03-17',
      odo: 200,
    });

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

    await maintenancePage.logMaintenance(logInput);

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 1000 km.',
    );

    await maintenancePage.logMaintenance({
      service: 'coolant-change',
      doneAt: '2026-03-18',
      odo: 300,
    });

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

    await maintenancePage.page.reload();

    await maintenancePage.getBikeCard(garageWithOneBike.make).click();
    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'Never logged',
    );
  });
});
