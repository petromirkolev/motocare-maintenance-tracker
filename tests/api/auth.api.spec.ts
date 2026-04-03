import { test, expect } from '../fixtures/api-fixtures';
import { api } from '../utils/api-helpers';
import { msg } from '../../constants/constants';

test.describe('Auth API test suite', () => {
  test('Register with valid credentials succeeds', async ({
    request,
    validUserInput,
  }) => {
    const response = await api.registerUser(request, validUserInput);
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.message).toBe(msg.USER_REG_OK);
  });

  test('Register with duplicate email is rejected', async ({
    request,
    validUserInput,
  }) => {
    await api.registerUser(request, validUserInput);

    const duplicateResponse = await api.registerUser(request, validUserInput);
    expect(duplicateResponse.status()).toBe(409);

    const duplicateBody = await duplicateResponse.json();
    expect(duplicateBody.error).toBe(msg.USER_EXISTS);
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
    expect(body.error).toBe(msg.EMAIL_INVALID);
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
    expect(body.error).toBe(msg.EMAIL_PASS_REQ);
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
    expect(body.error).toBe(msg.EMAIL_PASS_REQ);
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
    expect(body.error).toBe(msg.PASS_SHORT);
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
    expect(body.error).toBe(msg.PASS_LONG);
  });

  test('Login with valid credentials succeeds', async ({
    request,
    registeredUser,
  }) => {
    const loginResponse = await api.loginUser(request, registeredUser);
    expect(loginResponse.status()).toBe(200);

    const loginBody = await loginResponse.json();
    expect(loginBody.message).toBe(msg.USER_LOG_OK);
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
    expect(loginBody.error).toBe(msg.CRED_INVALID);
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
    expect(loginBody.error).toBe(msg.CRED_INVALID);
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
    expect(loginBody.error).toBe(msg.EMAIL_PASS_REQ);
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
    expect(loginBody.error).toBe(msg.EMAIL_PASS_REQ);
  });
});
