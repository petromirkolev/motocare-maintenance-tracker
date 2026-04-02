import { test, expect } from '../fixtures/api-fixtures';
import { api } from '../utils/api-helpers';
import {
  EMAIL_PASS_REQUIRED,
  INVALID_CREDENTIALS,
  INVALID_EMAIL,
  LOGIN_SUCCESS,
  PASS_LONG,
  PASS_SHORT,
  USER_EXIST,
  USER_REGISTER_SUCCESS,
} from '../utils/constants';

test.describe('Auth API test suite', () => {
  test('Register with valid credentials succeeds', async ({
    request,
    validUserInput,
  }) => {
    const response = await api.registerUser(request, validUserInput);
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.message).toBe(USER_REGISTER_SUCCESS);
  });

  test('Register with duplicate email is rejected', async ({
    request,
    validUserInput,
  }) => {
    await api.registerUser(request, validUserInput);

    const duplicateResponse = await api.registerUser(request, validUserInput);
    expect(duplicateResponse.status()).toBe(409);

    const duplicateBody = await duplicateResponse.json();
    expect(duplicateBody.error).toBe(USER_EXIST);
  });

  test('Register with invalid email is rejected', async ({
    request,
    validUserInput,
    invalidUserInput,
  }) => {
    const response = await api.registerUser(request, {
      ...validUserInput,
      email: invalidUserInput.email,
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe(INVALID_EMAIL);
  });

  test('Register with missing email is rejected', async ({
    request,
    validUserInput,
  }) => {
    const response = await api.registerUser(request, {
      ...validUserInput,
      email: undefined,
    });
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe(EMAIL_PASS_REQUIRED);
  });

  test('Register with missing password is rejected', async ({
    request,
    validUserInput,
  }) => {
    const response = await api.registerUser(request, {
      ...validUserInput,
      password: undefined,
    });
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe(EMAIL_PASS_REQUIRED);
  });

  test('Register with short password is rejected', async ({
    request,
    validUserInput,
    invalidUserInput,
  }) => {
    const response = await api.registerUser(request, {
      ...validUserInput,
      password: invalidUserInput.shortPassword,
    });
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe(PASS_SHORT);
  });

  test('Register with long password is rejected', async ({
    request,
    validUserInput,
    invalidUserInput,
  }) => {
    const response = await api.registerUser(request, {
      ...validUserInput,
      password: invalidUserInput.longPassword,
    });
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe(PASS_LONG);
  });

  test('Login with valid credentials succeeds', async ({
    request,
    registeredUser,
  }) => {
    const loginResponse = await api.loginUser(request, { ...registeredUser });

    expect(loginResponse.status()).toBe(200);

    const loginBody = await loginResponse.json();
    expect(loginBody.message).toBe(LOGIN_SUCCESS);
  });

  test('Login with wrong password is rejected', async ({
    request,
    registeredUser,
    invalidUserInput,
  }) => {
    const loginResponse = await api.loginUser(request, {
      ...registeredUser,
      password: invalidUserInput.password,
    });
    expect(loginResponse.status()).toBe(401);

    const loginBody = await loginResponse.json();
    expect(loginBody.error).toBe(INVALID_CREDENTIALS);
  });

  test('Login with non existing email is rejected', async ({
    request,
    registeredUser,
    invalidUserInput,
  }) => {
    const loginResponse = await api.loginUser(request, {
      ...registeredUser,
      email: invalidUserInput.email,
    });
    expect(loginResponse.status()).toBe(401);

    const loginBody = await loginResponse.json();
    expect(loginBody.error).toBe(INVALID_CREDENTIALS);
  });

  test('Login with missing email is rejected', async ({
    request,
    registeredUser,
  }) => {
    const loginResponse = await api.loginUser(request, {
      ...registeredUser,
      email: undefined,
    });
    expect(loginResponse.status()).toBe(400);

    const loginBody = await loginResponse.json();
    expect(loginBody.error).toBe(EMAIL_PASS_REQUIRED);
  });

  test('Login with missing password is rejected', async ({
    request,
    registeredUser,
  }) => {
    const loginResponse = await api.loginUser(request, {
      ...registeredUser,
      password: undefined,
    });
    expect(loginResponse.status()).toBe(400);

    const loginBody = await loginResponse.json();
    expect(loginBody.error).toBe(EMAIL_PASS_REQUIRED);
  });
});
