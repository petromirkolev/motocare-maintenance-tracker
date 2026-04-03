import { test as base, expect } from './base-fixtures';
import { invalidInput, uniqueEmail, validInput } from '../utils/test-data';
import { InvalidUserInput, ValidUserInput } from '../types/auth';
import { api } from '../utils/api-helpers';

type AuthFixtures = {
  validUserInput: ValidUserInput;
  invalidUserInput: InvalidUserInput;
  registeredUser: ValidUserInput;
  loggedInUser: ValidUserInput;
};

export const test = base.extend<AuthFixtures>({
  validUserInput: async ({}, use) => {
    await use({
      email: uniqueEmail(),
      password: validInput.password,
      confirmPassword: validInput.password,
    });
  },

  invalidUserInput: async ({}, use) => {
    await use(invalidInput);
  },

  registeredUser: async ({ request, validUserInput }, use) => {
    await api.registerUser(request, { ...validUserInput });

    await use(validUserInput);
  },

  loggedInUser: async ({ registeredUser, loginPage, garagePage }, use) => {
    await loginPage.gotologin();
    await expect(loginPage.loginScreen).toBeVisible();

    await loginPage.login(registeredUser);
    await garagePage.expectGarageVisible();

    await use(registeredUser);
  },
});

export { expect };
