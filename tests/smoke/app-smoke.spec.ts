// import { test, expect } from '@playwright/test';
// import { LoginPage } from '../pages/login-page';
// import { RegisterPage } from '../pages/register-page';
// import { GaragePage } from '../pages/garage-page';
// import { MaintenancePage } from '../pages/maintenance-page';

// const email = 'test@test.com';
// const password = 'testpass';

// test.describe('Moto Care smoke test suite', () => {
//   let regPage: RegisterPage;
//   let loginPage: LoginPage;
//   let garagePage: GaragePage;
//   let maintenancePage: MaintenancePage;

//   test.beforeEach(async ({ page }) => {
//     regPage = new RegisterPage(page);
//     loginPage = new LoginPage(page);
//     garagePage = new GaragePage(page);
//     maintenancePage = new MaintenancePage(page);
//   });

//   test('Moto Care app loads', async ({ page }) => {
//     await page.goto('/');
//     await expect(page).toHaveTitle(/Moto/i);
//   });

//   test('Register Moto Care app user', async () => {
//     await regPage.gotoreg();
//     await regPage.register(email, password);
//     await expect(regPage.regScreen).not.toBeVisible();
//     await expect(loginPage.loginScreen).toBeVisible();
//   });

//   test('Login with Moto Care app user', async () => {
//     await loginPage.goto();
//     await expect(loginPage.loginScreen).toBeVisible();
//     await loginPage.login(email, password);
//     await expect(garagePage.garageScreen).toBeVisible();
//   });
// });
