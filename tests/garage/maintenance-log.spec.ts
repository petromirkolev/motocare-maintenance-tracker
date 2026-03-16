// cancel log does not save
// missing date rejected
// missing odometer rejected
// negative odometer rejected
// lower odometer than previous/current rejected
// reload preserves logged values
// second newer log becomes current
// logging one item does not affect another

import { expect, test } from '@playwright/test';
import { GaragePage } from '../pages/garage-page';
import { RegisterPage } from '../pages/register-page';
import { LoginPage } from '../pages/login-page';
import { uniqueEmail, makeBike } from '../utils/test-data';
import { MaintenancePage } from '../pages/maintenance-page';

test.describe('Maintenance log test suite', () => {
  let registerPage: RegisterPage;
  let loginPage: LoginPage;
  let garagePage: GaragePage;
  let maintenancePage: MaintenancePage;
  let bike;
  let currentUser: { email: string; password: string };

  const doneAt = '2026-03-16';
  const odo = '100';

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

  test('Maintenance log modal is opening', async () => {
    await maintenancePage.goto();
    await maintenancePage.openMaintenanceLogModal('oil-service');
    await expect(maintenancePage.maintenanceLogModal).toBeVisible();
  });

  test('Maintenance log with valid days and kilometers saves and shows in UI', async () => {
    await maintenancePage.goto();
    await maintenancePage.openMaintenanceLogModal('oil-service');
    await expect(maintenancePage.maintenanceLogModal).toBeVisible();

    await maintenancePage.fillMaintenanceLog(doneAt, odo);
    await maintenancePage.saveMaintenanceLog();

    await expect(
      maintenancePage.oilServiceCard.locator('[data-field="last"]'),
    ).toContainText('March 16, 2026 at 100 km.');
  });

  test('Canceling maintenance log does not change UI', async () => {
    await maintenancePage.goto();
    await maintenancePage.openMaintenanceLogModal('oil-service');
    await expect(maintenancePage.maintenanceLogModal).toBeVisible();

    await maintenancePage.fillMaintenanceLog(doneAt, odo);
    await maintenancePage.cancelMaintenanceLog();

    await expect(
      maintenancePage.oilServiceCard.locator('[data-field="last"]'),
    ).toContainText('100');
  });
});
