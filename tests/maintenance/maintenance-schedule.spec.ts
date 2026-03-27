import { expect, test } from '../fixtures/maintenance-fixtures';

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

    await maintenancePage.scheduleMaintenance(
      'oil-change',
      scheduleInput.days,
      scheduleInput.km,
    );
    await maintenancePage.expectTaskFieldContains('oil-change', 'due', '100');
    await maintenancePage.expectTaskFieldContains('oil-change', 'due', '1000');
  });

  test('Maintenance schedule with missing days is rejected', async ({
    garageWithOneBike,
    maintenancePage,
    scheduleInput,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.scheduleMaintenance(
      'oil-change',
      '',
      scheduleInput.km,
    );

    await maintenancePage.expectScheduleError('Interval days are required');
  });

  test('Maintenance schedule with missing kilometers is rejected', async ({
    garageWithOneBike,
    maintenancePage,
    scheduleInput,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.scheduleMaintenance(
      'oil-change',
      scheduleInput.days,
      '',
    );

    await maintenancePage.expectScheduleError(
      'Interval kilometers are required',
    );
  });

  test('Maintenance schedule with missing days and kilometers is rejected', async ({
    garageWithOneBike,
    maintenancePage,
    scheduleInput,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.scheduleMaintenance('oil-change', '', '');

    await maintenancePage.expectScheduleError('Interval days are required');
  });

  test('Maintenance schedule with 0 days is rejected', async ({
    garageWithOneBike,
    maintenancePage,
    scheduleInput,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.scheduleMaintenance(
      'oil-change',
      '0',
      scheduleInput.km,
    );

    await maintenancePage.expectScheduleError(
      'Interval days must be a positive number',
    );
  });

  test('Maintenance schedule with 0 kilometers is rejected', async ({
    garageWithOneBike,
    maintenancePage,
    scheduleInput,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.scheduleMaintenance(
      'oil-change',
      scheduleInput.days,
      '0',
    );

    await maintenancePage.expectScheduleError(
      'Interval kilometers are required',
    );
  });

  test('Maintenance schedule with negative kilometers is rejected', async ({
    garageWithOneBike,
    maintenancePage,
    scheduleInput,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.scheduleMaintenance(
      'oil-change',
      scheduleInput.days,
      '-100',
    );

    await maintenancePage.expectScheduleError(
      'Interval kilometers must be a positive number',
    );
  });

  test('Maintenance schedule with negative days is rejected', async ({
    garageWithOneBike,
    maintenancePage,
    scheduleInput,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.scheduleMaintenance(
      'oil-change',
      '-100',
      scheduleInput.km,
    );

    await maintenancePage.expectScheduleError(
      'Interval days must be a positive number',
    );
  });

  test('Canceling maintenance schedule does not change UI', async ({
    garageWithOneBike,
    maintenancePage,
    scheduleInput,
  }) => {
    await maintenancePage.gotoMaintenance();

    await maintenancePage.openMaintenanceScheduleModal('oil-change');

    await maintenancePage.fillMaintenanceSchedule(
      scheduleInput.days,
      scheduleInput.km,
    );
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

    await maintenancePage.scheduleMaintenance(
      'oil-change',
      scheduleInput.days,
      scheduleInput.km,
    );

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

    await maintenancePage.scheduleMaintenance(
      'oil-change',
      scheduleInput.days,
      scheduleInput.km,
    );

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'due',
      'Every 100 days or 1000 km',
    );

    await maintenancePage.scheduleMaintenance('coolant-change', '400', '10000');

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
    bikeInput,
    scheduleInput,
  }) => {
    await garagePage.addBike(bikeInput);

    await garagePage.expectBikeVisible(bikeInput.make);

    const bikeCard = maintenancePage.getBikeCard(garageWithOneBike.make);

    await bikeCard.click();

    await maintenancePage.scheduleMaintenance(
      'oil-change',
      scheduleInput.days,
      scheduleInput.km,
    );
    await maintenancePage.expectTaskFieldContains('oil-change', 'due', '100');
    await maintenancePage.expectTaskFieldContains('oil-change', 'due', '1000');

    await maintenancePage.page.reload();

    const bike2Card = maintenancePage.getBikeCard(bikeInput.make);

    await bike2Card.click();

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'due',
      'Not scheduled yet',
    );
  });
});
