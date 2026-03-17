import { test } from '@playwright/test';
import { GaragePage } from '../pages/garage-page';
import { RegisterPage } from '../pages/register-page';
import { LoginPage } from '../pages/login-page';
import { uniqueEmail, makeBike } from '../utils/test-data';
import { MaintenancePage } from '../pages/maintenance-page';

test.describe('Maintenance status test suite', () => {
  let registerPage: RegisterPage;
  let loginPage: LoginPage;
  let garagePage: GaragePage;
  let maintenancePage: MaintenancePage;
  let bike: ReturnType<typeof makeBike>;
  let currentUser: { email: string; password: string };

  const doneAt = '2026-03-16';
  const odo = '1000';

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

  test('Maintenance status counts are zero when no maintenance logs are present', async () => {
    await maintenancePage.goto();
    await maintenancePage.expectStatusCounts('0', '0', '0');
  });

  test('New maintenance logs update the On Track badge', async () => {
    await maintenancePage.goto();

    await maintenancePage.logMaintenance('oil-change', doneAt, odo);
    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 1000 km.',
    );
    await maintenancePage.expectStatusCounts('1', '0', '0');

    await maintenancePage.logMaintenance('coolant-change', doneAt, odo);
    await maintenancePage.expectTaskFieldContains(
      'coolant-change',
      'last',
      'March 16, 2026 at 1000 km.',
    );
    await maintenancePage.expectStatusCounts('2', '0', '0');
  });

  test('Item becomes Due Soon by kilometers', async () => {
    await maintenancePage.goto();

    await maintenancePage.logMaintenance('oil-change', doneAt, odo);
    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 1000 km.',
    );
    await maintenancePage.expectStatusCounts('1', '0', '0');

    await maintenancePage.scheduleMaintenance('oil-change', '100', '500');
    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'due',
      'June 24, 2026 or at 1500 km.',
    );
    await maintenancePage.expectStatusCounts('1', '1', '0');
  });

  test('Item becomes Due Soon by days', async () => {
    await maintenancePage.goto();

    await maintenancePage.logMaintenance('oil-change', doneAt, odo);
    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 1000 km.',
    );
    await maintenancePage.expectStatusCounts('1', '0', '0');

    await maintenancePage.scheduleMaintenance('oil-change', '20', '1000');
    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'due',
      'April 5, 2026 or at 2000 km.',
    );
    await maintenancePage.expectStatusCounts('1', '1', '0');
  });

  test('Item becomes Overdue by kilometers', async () => {
    await maintenancePage.goto();

    await maintenancePage.logMaintenance('oil-change', doneAt, odo);
    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'March 16, 2026 at 1000 km.',
    );
    await maintenancePage.expectStatusCounts('1', '0', '0');

    await maintenancePage.scheduleMaintenance('oil-change', '100', '1000');
    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'due',
      'June 24, 2026 or at 2000 km.',
    );
    await maintenancePage.expectStatusCounts('1', '0', '0');

    await maintenancePage.backToGarageButton.click();
    await garagePage.fillEditBikeForm({ ...bike, odometer: '2100' });
    await garagePage.expectBikeVisible(bike.make);

    await maintenancePage.goto();
    await maintenancePage.expectStatusCounts('0', '0', '1');
  });

  test('Item becomes Overdue by days', async () => {
    await maintenancePage.goto();

    await maintenancePage.logMaintenance('oil-change', '2026-02-16', odo);
    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'last',
      'February 16, 2026 at 1000 km.',
    );

    await maintenancePage.scheduleMaintenance('oil-change', '10', '1000');
    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'due',
      'February 26, 2026 or at 2000 km.',
    );

    await maintenancePage.expectStatusCounts('0', '0', '1');
  });

  test('Bike A On Track/Due Soon/Overdue stats do not affect bike B', async ({
    page,
  }) => {
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
      'March 16, 2026 at 1000 km.',
    );
    await maintenancePage.expectStatusCounts('1', '0', '0');

    await maintenancePage.scheduleMaintenance('oil-change', '20', '1000');
    await maintenancePage.expectTaskFieldContains(
      'oil-change',
      'due',
      'April 5, 2026 or at 2000 km.',
    );
    await maintenancePage.expectStatusCounts('1', '1', '0');

    await page.reload();

    const bike2Card = page.locator('.bikeCard__main').filter({
      hasText: bike2.make,
    });

    await bike2Card.click();

    await maintenancePage.expectStatusCounts('0', '0', '0');
  });
});
