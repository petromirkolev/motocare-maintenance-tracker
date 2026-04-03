import { test, expect } from '../fixtures/auth-fixtures';
import { msg } from '../../constants/constants';
import { invalidEmailInput, invalidPasswordInput } from '../utils/test-data';

test.describe('Register page test suite', () => {
  test('User can register with valid credentials', async ({
    registerPage,
    validUserInput,
  }) => {
    await registerPage.register(validUserInput);
    await registerPage.expectSuccess(msg.USER_REG_OK);
  });

  test('User cannot register with existing credentials', async ({
    registeredUser,
    registerPage,
  }) => {
    await registerPage.register(registeredUser);
    await registerPage.expectError(msg.USER_EXISTS);
  });

  test('User cannot submit empty registration form', async ({
    registerPage,
  }) => {
    await registerPage.gotoreg();
    await registerPage.submit();
    await registerPage.expectError(msg.EMAIL_REQ);
  });

  test('User cannot register without email', async ({
    registerPage,
    validUserInput,
  }) => {
    await registerPage.register({ ...validUserInput, email: undefined });
    await registerPage.expectError(msg.EMAIL_REQ);
  });

  test('User cannot register without password', async ({
    registerPage,
    validUserInput,
  }) => {
    await registerPage.register({ ...validUserInput, password: undefined });
    await registerPage.expectError(msg.PASS_REQ);
  });

  test('User cannot register without confirm password', async ({
    registerPage,
    validUserInput,
  }) => {
    await registerPage.register({
      ...validUserInput,
      confirmPassword: undefined,
    });
    await registerPage.expectError(msg.PASS_CONF_REQ);
  });

  test('User cannot register with mismatched passwords', async ({
    registerPage,
    validUserInput,
    invalidUserInput,
  }) => {
    await registerPage.register({
      ...validUserInput,
      confirmPassword: invalidUserInput.password,
    });
    await registerPage.expectError(msg.PASS_NO_MATCH);
  });

  test('Cancel returns user to login page', async ({ registerPage }) => {
    await registerPage.gotoreg();
    await registerPage.clickCancel();
    await expect(registerPage.registerButton).toBeVisible();
  });

  test.describe('Invalid email', () => {
    for (const key of Object.keys(invalidEmailInput) as Array<
      keyof typeof invalidEmailInput
    >) {
      const { value, testDescription } = invalidEmailInput[key];

      test(`Register fails with: ${testDescription}`, async ({
        registerPage,
        validUserInput,
      }) => {
        await registerPage.register({ ...validUserInput, email: value });

        if (value === '    ' || value === '') {
          await registerPage.expectError(msg.EMAIL_REQ);
        } else {
          await registerPage.expectError(msg.EMAIL_INVALID);
        }
      });
    }
  });

  test.describe('Invalid password', () => {
    for (const key of Object.keys(invalidPasswordInput) as Array<
      keyof typeof invalidPasswordInput
    >) {
      const { value, testDescription } = invalidPasswordInput[key];
      test(`Register fails with: ${testDescription}`, async ({
        registerPage,
        validUserInput,
      }) => {
        await registerPage.register({ ...validUserInput, password: value });

        if (value === '' || value === '    ') {
          await registerPage.expectError(msg.PASS_REQ);
        } else if (value.length <= 4 && value.trim().length !== 0) {
          await registerPage.expectError(msg.PASS_SHORT);
        } else if (value.length > 32 && value.trim().length !== 0) {
          await registerPage.expectError(msg.PASS_LONG);
        }
      });
    }
  });
});
