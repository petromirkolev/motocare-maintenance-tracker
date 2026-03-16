import { test, expect, APIRequestContext } from '@playwright/test';
import { uniqueEmail } from '../utils/test-data';

const API_URL = 'http://127.0.0.1:3001';
const PASSWORD = 'testingpass';

type LoginResponse = {
  message: string;
  user: {
    id: string;
  };
};

async function registerUser(
  request: APIRequestContext,
  email: string,
  password = PASSWORD,
): Promise<void> {
  const response = await request.post(`${API_URL}/auth/register`, {
    data: {
      email,
      password,
    },
  });

  expect(response.status()).toBe(201);

  const body = await response.json();
  expect(body.message).toBe('User registered successfully');
}

async function loginUser(
  request: APIRequestContext,
  email: string,
  password = PASSWORD,
): Promise<LoginResponse> {
  const response = await request.post(`${API_URL}/auth/login`, {
    data: {
      email,
      password,
    },
  });

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.message).toBe('Login successful');

  return body as LoginResponse;
}

async function createBike(
  request: APIRequestContext,
  user_id: string,
  overrides: Partial<{
    make: string;
    model: string;
    year: number;
    odo: number;
  }> = {},
): Promise<void> {
  const response = await request.post(`${API_URL}/bikes`, {
    data: {
      user_id,
      make: 'Yamaha',
      model: 'Tracer 9GT',
      year: 2021,
      odo: 1000,
      ...overrides,
    },
  });

  expect(response.status()).toBe(201);

  const body = await response.json();
  expect(body.message).toBe('Bike created successfully');
}

async function listBikes(
  request: APIRequestContext,
  user_id: string,
): Promise<any[]> {
  const response = await request.get(`${API_URL}/bikes?userId=${user_id}`);

  expect(response.status()).toBe(200);

  const body = await response.json();
  return body.bikes;
}

async function getFirstBikeId(
  request: APIRequestContext,
  user_id: string,
): Promise<string> {
  const bikes = await listBikes(request, user_id);
  expect(bikes.length).toBeGreaterThan(0);
  return bikes[0].id;
}

test.describe('Garage API test suite', () => {
  let email: string;
  let user_id: string;

  test.beforeEach(async ({ request }) => {
    email = uniqueEmail('api-garage');
    await registerUser(request, email);
    const body = await loginUser(request, email);
    user_id = body.user.id;
  });

  test('Create bike with valid data succeeds', async ({ request }) => {
    await createBike(request, user_id);
  });

  test('Create bike with invalid year above maximum is rejected', async ({
    request,
  }) => {
    const response = await request.post(`${API_URL}/bikes`, {
      data: {
        user_id,
        make: 'Yamaha',
        model: 'Tracer 9GT',
        year: 2101,
        odo: 1000,
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Year must be an integer between 1900 and 2100');
  });

  test('Create bike with invalid year below minimum is rejected', async ({
    request,
  }) => {
    const response = await request.post(`${API_URL}/bikes`, {
      data: {
        user_id,
        make: 'Yamaha',
        model: 'Tracer 9GT',
        year: 1899,
        odo: 1000,
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Year must be an integer between 1900 and 2100');
  });

  test('Create bike with negative odometer is rejected', async ({
    request,
  }) => {
    const response = await request.post(`${API_URL}/bikes`, {
      data: {
        user_id,
        make: 'Yamaha',
        model: 'Tracer 9GT',
        year: 2021,
        odo: -1000,
      },
    });

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe('Odometer must be a non-negative integer');
  });

  test('Update bike with valid data succeeds', async ({ request }) => {
    await createBike(request, user_id);
    const bike_id = await getFirstBikeId(request, user_id);

    const updateResponse = await request.put(`${API_URL}/bikes/${bike_id}`, {
      data: {
        id: bike_id,
        user_id,
        make: 'Honda',
        model: 'Rebel',
        year: 2022,
        odo: 1500,
      },
    });

    expect(updateResponse.status()).toBe(200);

    const updateBody = await updateResponse.json();
    expect(updateBody.message).toBe('Bike updated successfully');

    const bikes = await listBikes(request, user_id);
    expect(bikes[0].make).toBe('Honda');
    expect(bikes[0].model).toBe('Rebel');
    expect(bikes[0].year).toBe(2022);
    expect(bikes[0].odo).toBe(1500);
  });

  test('Update bike with lower odometer is rejected', async ({ request }) => {
    await createBike(request, user_id);
    const bike_id = await getFirstBikeId(request, user_id);

    const updateResponse = await request.put(`${API_URL}/bikes/${bike_id}`, {
      data: {
        id: bike_id,
        user_id,
        make: 'Yamaha',
        model: 'Tracer 9GT',
        year: 2021,
        odo: 900,
      },
    });

    expect(updateResponse.status()).toBe(400);

    const updateBody = await updateResponse.json();
    expect(updateBody.error).toBe('Odometer cannot decrease');
  });

  test('Delete bike succeeds', async ({ request }) => {
    await createBike(request, user_id);
    const bike_id = await getFirstBikeId(request, user_id);

    const deleteResponse = await request.delete(
      `${API_URL}/bikes/${bike_id}?userId=${user_id}`,
    );

    expect(deleteResponse.status()).toBe(200);

    const deleteBody = await deleteResponse.json();
    expect(deleteBody.message).toBe('Bike deleted successfully');

    const bikes = await listBikes(request, user_id);
    expect(bikes).toHaveLength(0);
  });
});
