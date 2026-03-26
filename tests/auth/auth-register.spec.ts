import { test, expect } from '../fixtures/auth-fixtures';
import {
  invalidEmailInput,
  invalidPasswordInput,
  validInput,
  uniqueEmail,
} from '../utils/test-data';

test.describe('Register page test suite', () => {
  test('User can register with valid credentials', async ({ registerPage }) => {
    await registerPage.register(uniqueEmail(), validInput.password);
    await registerPage.expectSuccess('Registration successful!');
  });

  test('User cannot register with existing credentials', async ({
    registeredUser,
    registerPage,
  }) => {
    await registerPage.register(registeredUser.email, registeredUser.password);
    await registerPage.expectError('User already exists');
  });

  test('User cannot submit empty registration form', async ({
    registerPage,
  }) => {
    await registerPage.gotoreg();
    await registerPage.submit();
    await registerPage.expectError('Email is required');
  });

  test('User cannot register without email', async ({ registerPage }) => {
    await registerPage.register('', validInput.password);
    await registerPage.expectError('Email is required');
  });

  test('User cannot register without password', async ({ registerPage }) => {
    await registerPage.register(uniqueEmail(), '');
    await registerPage.expectError('Password is required');
  });

  test('User cannot register without confirm password', async ({
    registerPage,
  }) => {
    await registerPage.gotoreg();
    await registerPage.fillEmail(uniqueEmail());
    await registerPage.fillPassword(validInput.password);
    await registerPage.fillConfirmPassword('');
    await registerPage.submit();
    await registerPage.expectError('Confirm password is required');
  });

  test('User cannot register with mismatched passwords', async ({
    registerPage,
  }) => {
    await registerPage.gotoreg();
    await registerPage.fillEmail(uniqueEmail());
    await registerPage.fillPassword(validInput.password);
    await registerPage.fillConfirmPassword('testingthepass');
    await registerPage.submit();
    await registerPage.expectError('Passwords do not match');
  });

  test('Cancel returns user to login page', async ({ registerPage }) => {
    await registerPage.gotoreg();
    await registerPage.clickCancel();
    await expect(registerPage.registerButton).toBeVisible();
  });

  test.describe('Invalid email', () => {
    for (const key of Object.keys(invalidEmailInput)) {
      const { value, testDescription } = invalidEmailInput[key];

      test(`Register fails with: ${testDescription}`, async ({
        registerPage,
      }) => {
        await registerPage.register(value, validInput.password);

        if (value === '    ' || value === '') {
          await registerPage.expectError('Email is required');
        } else {
          await registerPage.expectError('Invalid email format');
        }
      });
    }
  });

  test.describe('Invalid password', () => {
    for (const key of Object.keys(invalidPasswordInput)) {
      const { value, testDescription } = invalidPasswordInput[key];
      test(`Register fails with: ${testDescription}`, async ({
        registerPage,
      }) => {
        await registerPage.register('invalidpass@test.com', value);

        if (value === '' || value === '    ') {
          await registerPage.expectError('Password is required');
        } else if (value.length <= 4 && value.trim().length !== 0) {
          await registerPage.expectError(
            'Password must be 8 characters at minimum',
          );
        } else if (value.length > 32 && value.trim().length !== 0) {
          await registerPage.expectError(
            'Password must be 32 characters at maximum',
          );
        }
      });
    }
  });
});
