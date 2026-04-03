import { test } from '../fixtures/auth-fixtures';
import { msg } from '../../constants/constants';
import { invalidEmailInput, invalidPasswordInput } from '../utils/test-data';

test.describe('Login page test suite', () => {
  test('User can log in with registered credentials', async ({
    registeredUser,
    loginPage,
    garagePage,
  }) => {
    await loginPage.login(registeredUser);
    await loginPage.expectLoginSuccess(msg.USER_LOG_OK);
    await garagePage.expectGarageVisible();
  });

  test('Login fails with unregistered credentials', async ({
    loginPage,
    validUserInput,
  }) => {
    await loginPage.login(validUserInput);
    await loginPage.expectLoginError(msg.CRED_INVALID);
  });

  test('Login with missing email', async ({ loginPage, validUserInput }) => {
    await loginPage.login({
      ...validUserInput,
      email: undefined,
    });
    await loginPage.expectLoginError(msg.EMAIL_REQ);
  });

  test('Login with missing password', async ({ loginPage, validUserInput }) => {
    await loginPage.login({ ...validUserInput, password: undefined });
    await loginPage.expectLoginError(msg.PASS_REQ);
  });

  for (const key of Object.keys(invalidEmailInput) as Array<
    keyof typeof invalidEmailInput
  >) {
    const { value, testDescription } = invalidEmailInput[key];

    test(`Login fails with: ${testDescription}`, async ({
      loginPage,
      validUserInput,
    }) => {
      await loginPage.login({ ...validUserInput, email: value });

      if (value === '    ' || value === '') {
        await loginPage.expectLoginError(msg.EMAIL_REQ);
      } else {
        await loginPage.expectLoginError(msg.EMAIL_INVALID);
      }
    });
  }

  for (const key of Object.keys(invalidPasswordInput) as Array<
    keyof typeof invalidPasswordInput
  >) {
    const { value, testDescription } = invalidPasswordInput[key];

    test(`Login fails with: ${testDescription}`, async ({
      loginPage,
      validUserInput,
    }) => {
      await loginPage.login({ ...validUserInput, password: value });

      if (value === '    ' || value === '') {
        await loginPage.expectLoginError(msg.PASS_REQ);
      } else {
        await loginPage.expectLoginError(msg.CRED_INVALID);
      }
    });
  }
});
