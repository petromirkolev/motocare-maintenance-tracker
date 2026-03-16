import { expect, test } from '@playwright/test';
import { GaragePage } from '../pages/garage-page';
import { RegisterPage } from '../pages/register-page';
import { LoginPage } from '../pages/login-page';
import { uniqueEmail, makeBike } from '../utils/test-data';
import { MaintenancePage } from '../pages/maintenance-page';

test.describe('Maintenance page test suite', () => {
  let maintenancePage: MaintenancePage;
  let currentUser: { email: string; password: string };

  test.beforeEach(async ({ page }) => {
    currentUser = {
      email: uniqueEmail('garage'),
      password: 'testingpass',
    };

    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);
    const garagePage = new GaragePage(page);
    maintenancePage = new MaintenancePage(page);
    const bike = makeBike();

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

  test('Maintenance schedule modal is loaded', async () => {
    await maintenancePage.goto();
    await maintenancePage.scheduleOilService.click();
    await expect(maintenancePage.maintenanceModal).toBeVisible();
  });
});
