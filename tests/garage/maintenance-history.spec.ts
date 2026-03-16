import { expect, test } from '@playwright/test';
import { GaragePage } from '../pages/garage-page';
import { RegisterPage } from '../pages/register-page';
import { LoginPage } from '../pages/login-page';
import { uniqueEmail, makeBike } from '../utils/test-data';
import { MaintenancePage } from '../pages/maintenance-page';

test.describe('Maintenance history test suite', () => {
  let registerPage: RegisterPage;
  let loginPage: LoginPage;
  let garagePage: GaragePage;
  let maintenancePage: MaintenancePage;
  let bike: ReturnType<typeof makeBike>;
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

  test('Maintenance history is empty when no maintenance logs are saved', async () => {
    await maintenancePage.goto();

    await expect(maintenancePage.maintenanceHistoryContainer).toContainText(
      'No service history yet',
    );
  });

  test('New history log appears on maintenance log submit', async () => {
    await maintenancePage.goto();

    await expect(maintenancePage.maintenanceHistoryContainer).toContainText(
      'No service history yet',
    );

    await maintenancePage.logMaintenance('oil-change', doneAt, odo);
    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 100 km.',
    );

    await expect(maintenancePage.maintenanceHistoryContainer).toContainText(
      'OIL CHANGE Done on March 16, 2026 at 100 km.',
    );
  });

  test('History panel shows only the most recent maintenance log', async () => {
    await maintenancePage.goto();

    await expect(maintenancePage.maintenanceHistoryContainer).toContainText(
      'No service history yet',
    );

    await maintenancePage.logMaintenance('oil-change', doneAt, odo);
    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 100 km.',
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
      'OIL CHANGE Done on March 16, 2026 at 100 km.',
    );
  });

  test('History log persists after refresh', async () => {
    await maintenancePage.goto();

    await expect(maintenancePage.maintenanceHistoryContainer).toContainText(
      'No service history yet',
    );

    await maintenancePage.logMaintenance('oil-change', doneAt, odo);
    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 100 km.',
    );

    await expect(maintenancePage.maintenanceHistoryContainer).toContainText(
      'OIL CHANGE Done on March 16, 2026 at 100 km.',
    );

    await maintenancePage.page.reload();
    await maintenancePage.goto();

    await expect(maintenancePage.maintenanceHistoryContainer).toContainText(
      'OIL CHANGE Done on March 16, 2026 at 100 km.',
    );
  });

  test('History log of bike A does not appear in bike B', async ({ page }) => {
    const bike2 = makeBike();

    await garagePage.fillAddBikeForm(bike2);
    await garagePage.expectBikeVisible(bike2.make);

    const bikeCard = page.locator('.bikeCard__main').filter({
      hasText: bike.make,
    });

    await bikeCard.click();

    await maintenancePage.logMaintenance('oil-change', doneAt, odo);
    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 100 km.',
    );

    await expect(maintenancePage.maintenanceHistoryContainer).toContainText(
      'OIL CHANGE Done on March 16, 2026 at 100 km.',
    );

    await page.reload();

    const bike2Card = page.locator('.bikeCard__main').filter({
      hasText: bike2.make,
    });

    await bike2Card.click();

    await expect(maintenancePage.maintenanceHistoryContainer).toContainText(
      'No service history yet',
    );
  });
});
