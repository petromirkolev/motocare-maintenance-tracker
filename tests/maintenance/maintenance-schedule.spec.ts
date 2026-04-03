import { msg } from '../../constants/constants';
import { expect, test } from '../fixtures/maintenance-fixtures';
import { makeBike } from '../utils/test-data';

test.describe('Maintenance schedule', () => {
  test('User can open maintenance schedule modal', async ({
    garageWithOneBike,
    maintenancePage,
  }) => {
    await maintenancePage.gotoMaintenance();
    await maintenancePage.openMaintenanceScheduleModal('oil-change');
  });

  test('Maintenance schedule with valid days and kilometers saves and shows in UI', async ({
    garageWithOneBike,
    maintenancePage,
    scheduleInput,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.scheduleMaintenance(scheduleInput);

    await maintenancePage.expectTaskFieldContains('oil-change', 'due', '100');
    await maintenancePage.expectTaskFieldContains('oil-change', 'due', '1000');
  });

  test('Maintenance schedule with missing days is rejected', async ({
    garageWithOneBike,
    maintenancePage,
    scheduleInput,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.scheduleMaintenance({
      ...scheduleInput,
      interval_days: Number(''),
    });

    await maintenancePage.expectScheduleError(msg.MAINT_DAYS_POS);
  });

  test('Maintenance schedule with missing kilometers is rejected', async ({
    garageWithOneBike,
    maintenancePage,
    scheduleInput,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.scheduleMaintenance({
      ...scheduleInput,
      interval_km: Number(''),
    });

    await maintenancePage.expectScheduleError(msg.MAINT_KM_REQ);
  });

  test('Maintenance schedule with missing days and kilometers is rejected', async ({
    garageWithOneBike,
    maintenancePage,
    scheduleInput,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.scheduleMaintenance({
      ...scheduleInput,
      interval_days: Number(''),
      interval_km: Number(''),
    });

    await maintenancePage.expectScheduleError(msg.MAINT_KM_REQ);
  });

  test('Maintenance schedule with 0 days is rejected', async ({
    garageWithOneBike,
    maintenancePage,
    scheduleInput,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.scheduleMaintenance({
      ...scheduleInput,
      interval_days: 0,
    });

    await maintenancePage.expectScheduleError(msg.MAINT_DAYS_POS);
  });

  test('Maintenance schedule with 0 kilometers is rejected', async ({
    garageWithOneBike,
    maintenancePage,
    scheduleInput,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.scheduleMaintenance({
      ...scheduleInput,
      interval_km: 0,
    });

    await maintenancePage.expectScheduleError(msg.MAINT_KM_REQ);
  });

  test('Maintenance schedule with negative kilometers is rejected', async ({
    garageWithOneBike,
    maintenancePage,
    scheduleInput,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.scheduleMaintenance({
      ...scheduleInput,
      interval_km: -100,
    });

    await maintenancePage.expectScheduleError(msg.MAINT_KM_POS);
  });

  test('Maintenance schedule with negative days is rejected', async ({
    garageWithOneBike,
    maintenancePage,
    scheduleInput,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.scheduleMaintenance({
      ...scheduleInput,
      interval_days: -100,
    });

    await maintenancePage.expectScheduleError(msg.MAINT_DAYS_POS);
  });

  test('Canceling maintenance schedule does not change UI', async ({
    garageWithOneBike,
    maintenancePage,
    scheduleInput,
  }) => {
    await maintenancePage.gotoMaintenance();
    await maintenancePage.openMaintenanceScheduleModal('oil-change');

    await maintenancePage.fillMaintenanceSchedule(scheduleInput);
    await maintenancePage.cancelMaintenanceSchedule();

    await expect(
      maintenancePage.getTaskField('oil-change', 'due'),
    ).not.toContainText('100');
    await expect(
      maintenancePage.getTaskField('oil-change', 'due'),
    ).not.toContainText('1000');
  });

  test('Reloading maintenance page shows saved schedule values', async ({
    garageWithOneBike,
    maintenancePage,
    scheduleInput,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.scheduleMaintenance(scheduleInput);

    await maintenancePage.expectTaskFieldContains('oil-change', 'due', '100');
    await maintenancePage.expectTaskFieldContains('oil-change', 'due', '1000');

    await maintenancePage.page.reload();
    await maintenancePage.gotoMaintenance();

    await maintenancePage.expectTaskFieldContains('oil-change', 'due', '100');
    await maintenancePage.expectTaskFieldContains('oil-change', 'due', '1000');
  });

  test('Scheduling one maintenance item does not affect another maintenance item', async ({
    garageWithOneBike,
    maintenancePage,
    scheduleInput,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.scheduleMaintenance(scheduleInput);

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'due',
      'Every 100 days or 1000 km',
    );

    await maintenancePage.scheduleMaintenance({
      service: 'coolant-change',
      interval_days: 400,
      interval_km: 10000,
    });

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'due',
      'Every 100 days or 1000 km',
    );
    await maintenancePage.expectTaskFieldContains(
      'coolant-change',
      'due',
      'Every 400 days or 10000 km',
    );
  });

  test('Scheduling maintenance for bike A does not affect bike B', async ({
    garageWithOneBike,
    garagePage,
    maintenancePage,
    scheduleInput,
  }) => {
    const bike = makeBike();

    await garagePage.addBike(bike);
    await garagePage.expectBikeVisible(bike.make);

    await maintenancePage.getBikeCard(garageWithOneBike.make).click();

    await maintenancePage.scheduleMaintenance(scheduleInput);
    await maintenancePage.expectTaskFieldContains('oil-change', 'due', '100');
    await maintenancePage.expectTaskFieldContains('oil-change', 'due', '1000');

    await maintenancePage.page.reload();

    await maintenancePage.getBikeCard(bike.make).click();
    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'due',
      'Not scheduled yet',
    );
  });
});
