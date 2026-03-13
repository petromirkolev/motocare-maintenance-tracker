import { test, expect } from '@playwright/test';
import { GaragePage } from '../pages/garage-page';
import { RegisterPage } from '../pages/register-page';
import { LoginPage } from '../pages/login-page';

test.describe('Garage page test suite', () => {
  let garagePage: GaragePage;
  const email = 'test@test.com';
  const password = 'testingpass';

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    const registerPage = new RegisterPage(page);

    await registerPage.gotoreg();
    await registerPage.register(email, password);
    await registerPage.expectSuccess('Registration successful');
  });

  test.beforeEach(async ({ page }) => {
    garagePage = new GaragePage(page);
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(email, password);
    await loginPage.expectSuccess('Login success, opening garage...');
    await garagePage.expectLoaded();
  });

  test('User can create a bike', async () => {
    const bike = {
      name: `Test Bike ${Date.now()}`,
      model: 'Tracer 9 GT',
      year: '2021',
      odometer: '12000',
    };

    await garagePage.expectLoaded();
    await garagePage.openAddBike();
    await garagePage.fillBikeForm(bike);
    await garagePage.submitBike();
    await garagePage.expectBikeVisible(bike.name);
  });
});

// seed or create the user in beforeAll
// login in beforeEach
