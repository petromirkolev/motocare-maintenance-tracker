import { expect, test } from '@playwright/test';
import { GaragePage } from '../pages/garage-page';
import { RegisterPage } from '../pages/register-page';
import { LoginPage } from '../pages/login-page';
import { uniqueEmail, makeBike } from '../utils/test-data';
import { MaintenancePage } from '../pages/maintenance-page';

test.describe('Maintenance schedule test suite', () => {
  let registerPage: RegisterPage;
  let loginPage: LoginPage;
  let garagePage: GaragePage;
  let maintenancePage: MaintenancePage;
  let bike: ReturnType<typeof makeBike>;
  let currentUser: { email: string; password: string };

  const days = '100';
  const km = '1000';

  test.beforeEach(async ({ page }) => {
    currentUser = {
      email: uniqueEmail('garage'),
      password: 'testingpass',
    };

    registerPage = new RegisterPage(page);
    loginPage = new LoginPage(page);
    garagePage = new GaragePage(page);
    maintenancePage = new MaintenancePage(page);

    bike = makeBike();

    await registerPage.gotoreg();
    await registerPage.register(currentUser.email, currentUser.password);
    await registerPage.expectSuccess('Registration successful');

    await loginPage.goto();
    await loginPage.login(currentUser.email, currentUser.password);
    await loginPage.expectSuccess('Login success, opening garage...');
    await garagePage.expectGarageLoaded();

    await garagePage.fillAddBikeForm(bike);
    await garagePage.expectBikeVisible(bike.make);
  });

  test('Maintenance schedule modal is opening', async () => {
    await maintenancePage.goto();
    await maintenancePage.openMaintenanceScheduleModal('oil-change');
    await expect(maintenancePage.maintenanceScheduleModal).toBeVisible();
  });

  test('Maintenance schedule with valid days and kilometers saves and shows in UI', async () => {
    await maintenancePage.goto();

    await maintenancePage.scheduleMaintenance('oil-change', days, km);
    await maintenancePage.expectTaskFieldContains('oil-change', 'due', '100');
    await maintenancePage.expectTaskFieldContains('oil-change', 'due', '1000');
  });

  test('Maintenance schedule with missing days is rejected', async () => {
    await maintenancePage.goto();
    await maintenancePage.openMaintenanceScheduleModal('oil-change');
    await expect(maintenancePage.maintenanceScheduleModal).toBeVisible();

    await maintenancePage.fillMaintenanceSchedule('', km);
    await maintenancePage.saveMaintenanceSchedule();

    await maintenancePage.expectScheduleError('Interval days are required');
  });

  test('Maintenance schedule with missing kilometers is rejected', async () => {
    await maintenancePage.goto();
    await maintenancePage.openMaintenanceScheduleModal('oil-change');
    await expect(maintenancePage.maintenanceScheduleModal).toBeVisible();

    await maintenancePage.fillMaintenanceSchedule(days, '');
    await maintenancePage.saveMaintenanceSchedule();

    await maintenancePage.expectScheduleError(
      'Interval kilometers are required',
    );
  });

  test('Maintenance schedule with missing days and kilometers is rejected', async () => {
    await maintenancePage.goto();
    await maintenancePage.openMaintenanceScheduleModal('oil-change');
    await expect(maintenancePage.maintenanceScheduleModal).toBeVisible();

    await maintenancePage.fillMaintenanceSchedule('', '');
    await maintenancePage.saveMaintenanceSchedule();

    await maintenancePage.expectScheduleError('Interval days are required');
  });

  test('Maintenance schedule with 0 days is rejected', async () => {
    await maintenancePage.goto();
    await maintenancePage.openMaintenanceScheduleModal('oil-change');
    await expect(maintenancePage.maintenanceScheduleModal).toBeVisible();

    await maintenancePage.fillMaintenanceSchedule('0', km);
    await maintenancePage.saveMaintenanceSchedule();

    await maintenancePage.expectScheduleError(
      'Interval days must be a positive number',
    );
  });

  test('Maintenance schedule with 0 kilometers is rejected', async () => {
    await maintenancePage.goto();
    await maintenancePage.openMaintenanceScheduleModal('oil-change');
    await expect(maintenancePage.maintenanceScheduleModal).toBeVisible();

    await maintenancePage.fillMaintenanceSchedule(days, '0');
    await maintenancePage.saveMaintenanceSchedule();

    await maintenancePage.expectScheduleError(
      'Interval kilometers are required',
    );
  });

  test('Maintenance schedule with negative kilometers is rejected', async () => {
    await maintenancePage.goto();
    await maintenancePage.openMaintenanceScheduleModal('oil-change');
    await expect(maintenancePage.maintenanceScheduleModal).toBeVisible();

    await maintenancePage.fillMaintenanceSchedule(days, '-100');
    await maintenancePage.saveMaintenanceSchedule();

    await maintenancePage.expectScheduleError(
      'Interval kilometers must be a positive number',
    );
  });

  test('Maintenance schedule with negative days is rejected', async () => {
    await maintenancePage.goto();
    await maintenancePage.openMaintenanceScheduleModal('oil-change');
    await expect(maintenancePage.maintenanceScheduleModal).toBeVisible();

    await maintenancePage.fillMaintenanceSchedule('-100', km);
    await maintenancePage.saveMaintenanceSchedule();

    await maintenancePage.expectScheduleError(
      'Interval days must be a positive number',
    );
  });

  test('Canceling maintenance schedule does not change UI', async () => {
    await maintenancePage.goto();
    await maintenancePage.openMaintenanceScheduleModal('oil-change');
    await expect(maintenancePage.maintenanceScheduleModal).toBeVisible();

    await maintenancePage.fillMaintenanceSchedule(days, km);
    await maintenancePage.cancelMaintenanceSchedule();

    await expect(
      maintenancePage.getTaskField('oil-change', 'due'),
    ).not.toContainText('100');
    await expect(
      maintenancePage.getTaskField('oil-change', 'due'),
    ).not.toContainText('1000');
  });

  test('Reloading maintenance page shows saved schedule values', async ({
    page,
  }) => {
    await maintenancePage.goto();

    await maintenancePage.scheduleMaintenance('oil-change', days, km);
    await maintenancePage.expectTaskFieldContains('oil-change', 'due', '100');
    await maintenancePage.expectTaskFieldContains('oil-change', 'due', '1000');

    await page.reload();
    await maintenancePage.goto();

    await maintenancePage.expectTaskFieldContains('oil-change', 'due', '100');
    await maintenancePage.expectTaskFieldContains('oil-change', 'due', '1000');
  });

  test('Scheduling one maintenance item does not affect another maintenance item', async () => {
    await maintenancePage.goto();

    await maintenancePage.scheduleMaintenance('oil-change', days, km);
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
    page,
  }) => {
    const bike2 = makeBike();

    await garagePage.fillAddBikeForm(bike2);
    await garagePage.expectBikeVisible(bike2.make);

    const bikeCard = page.locator('.bikeCard__main').filter({
      hasText: bike.make,
    });

    await bikeCard.click();

    await maintenancePage.scheduleMaintenance('oil-change', days, km);
    await maintenancePage.expectTaskFieldContains('oil-change', 'due', '100');
    await maintenancePage.expectTaskFieldContains('oil-change', 'due', '1000');

    await page.reload();

    const bike2Card = page.locator('.bikeCard__main').filter({
      hasText: bike2.make,
    });

    await bike2Card.click();

    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'due',
      'Not scheduled yet',
    );
  });
});
