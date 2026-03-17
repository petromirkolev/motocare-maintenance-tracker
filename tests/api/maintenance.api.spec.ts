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

test.describe('Maintenance API test suite', () => {
  let email: string;
  let user_id: string;

  test.beforeEach(async ({ request }) => {
    email = uniqueEmail('api-maintenance');
    await registerUser(request, email);
    const body = await loginUser(request, email);
    user_id = body.user.id;
  });

  test('Maintenance schedule with valid days/km succeeds', async ({
    request,
  }) => {
    await createBike(request, user_id);

    const bike_id = await getFirstBikeId(request, user_id);

    const upsertResponse = await request.post(`${API_URL}/maintenance/upsert`, {
      data: {
        bike_id,
        name: 'oil-change',
        interval_km: 1000,
        interval_days: 100,
      },
    });

    expect(upsertResponse.status()).toBe(201);

    const upsertBody = await upsertResponse.json();

    expect(upsertBody.message).toBe('Maintenance created successfully');

    const listResponse = await request.get(
      `${API_URL}/maintenance?bikeId=${bike_id}`,
    );

    expect(listResponse.status()).toBe(200);

    const listBody = await listResponse.json();
    expect(listBody.maintenance).toHaveLength(1);
    expect(listBody.maintenance[0].bike_id).toBe(bike_id);
    expect(listBody.maintenance[0].name).toBe('oil-change');
    expect(listBody.maintenance[0].interval_km).toBe(1000);
    expect(listBody.maintenance[0].interval_days).toBe(100);
  });

  test('Maintenance schedule with missing days is rejected', async ({
    request,
  }) => {
    await createBike(request, user_id);

    const bike_id = await getFirstBikeId(request, user_id);

    const upsertResponse = await request.post(`${API_URL}/maintenance/upsert`, {
      data: {
        bike_id,
        name: 'oil-change',
        interval_km: 1000,
        interval_days: '',
      },
    });

    expect(upsertResponse.status()).toBe(400);

    const upsertBody = await upsertResponse.json();

    expect(upsertBody.error).toBe('interval_days must be a positive integer');
  });

  test('Maintenance schedule with missing kilometers is rejected', async ({
    request,
  }) => {
    await createBike(request, user_id);

    const bike_id = await getFirstBikeId(request, user_id);

    const upsertResponse = await request.post(`${API_URL}/maintenance/upsert`, {
      data: {
        bike_id,
        name: 'oil-change',
        interval_km: '',
        interval_days: 100,
      },
    });

    expect(upsertResponse.status()).toBe(400);

    const upsertBody = await upsertResponse.json();

    expect(upsertBody.error).toBe('interval_km must be a positive integer');
  });

  test('Maintenance log with valid date/odo succeeds', async ({ request }) => {
    await createBike(request, user_id);

    const bike_id = await getFirstBikeId(request, user_id);

    const upsertResponse = await request.post(`${API_URL}/maintenance/upsert`, {
      data: {
        bike_id,
        name: 'oil-change',
        date: '2026-03-16',
        odo: 500,
      },
    });

    expect(upsertResponse.status()).toBe(201);

    const upsertBody = await upsertResponse.json();

    expect(upsertBody.message).toBe('Maintenance created successfully');

    const listResponse = await request.get(
      `${API_URL}/maintenance?bikeId=${bike_id}`,
    );

    expect(listResponse.status()).toBe(200);

    const listBody = await listResponse.json();
    expect(listBody.maintenance).toHaveLength(1);
    expect(listBody.maintenance[0].bike_id).toBe(bike_id);
    expect(listBody.maintenance[0].name).toBe('oil-change');
    expect(listBody.maintenance[0].date).toBe('2026-03-16');
    expect(listBody.maintenance[0].odo).toBe(500);
  });

  test('Maintenance log with negative odo is rejected', async ({ request }) => {
    await createBike(request, user_id);

    const bike_id = await getFirstBikeId(request, user_id);

    const upsertResponse = await request.post(`${API_URL}/maintenance/upsert`, {
      data: {
        bike_id,
        name: 'oil-change',
        date: '2026-03-16',
        odo: -500,
      },
    });

    expect(upsertResponse.status()).toBe(400);

    const upsertBody = await upsertResponse.json();

    expect(upsertBody.error).toBe('Odo must be a non-negative integer');
  });

  test('Maintenance schedule for bike A does not affect bike B', async ({
    request,
  }) => {
    await createBike(request, user_id);
    await createBike(request, user_id, {
      make: 'Honda',
      model: 'Rebel',
      odo: 1000,
      year: 2000,
    });

    const bikes = await listBikes(request, user_id);

    const bikeOneId = bikes[0].id;
    const bikeTwoId = bikes[1].id;

    const logResponse = await request.post(`${API_URL}/maintenance/upsert`, {
      data: {
        bike_id: bikeOneId,
        name: 'oil-change',
        date: '2026-03-16',
        odo: 500,
      },
    });

    expect(logResponse.status()).toBe(201);

    const logBody = await logResponse.json();

    expect(logBody.message).toBe('Maintenance created successfully');

    const scheduleResponse = await request.post(
      `${API_URL}/maintenance/upsert`,
      {
        data: {
          bike_id: bikeOneId,
          name: 'oil-change',
          interval_km: 1000,
          interval_days: 100,
        },
      },
    );

    expect(scheduleResponse.status()).toBe(200);

    const scheduleBody = await scheduleResponse.json();

    expect(scheduleBody.message).toBe('Maintenance scheduled successfully');

    const bikeOneListResponse = await request.get(
      `${API_URL}/maintenance?bikeId=${bikeOneId}`,
    );

    expect(bikeOneListResponse.status()).toBe(200);

    const bikeOneListBody = await bikeOneListResponse.json();

    expect(bikeOneListBody.maintenance).toHaveLength(1);
    expect(bikeOneListBody.maintenance[0].bike_id).toBe(bikeOneId);
    expect(bikeOneListBody.maintenance[0].name).toBe('oil-change');
    expect(bikeOneListBody.maintenance[0].interval_km).toBe(1000);
    expect(bikeOneListBody.maintenance[0].interval_days).toBe(100);

    const bikeTwoListResponse = await request.get(
      `${API_URL}/maintenance?bikeId=${bikeTwoId}`,
    );

    expect(bikeTwoListResponse.status()).toBe(200);

    const bikeTwoListBody = await bikeTwoListResponse.json();

    expect(bikeTwoListBody.maintenance).toHaveLength(0);
  });

  test('Maintenance log for bike A does not affect bike B', async ({
    request,
  }) => {
    await createBike(request, user_id);
    await createBike(request, user_id, {
      make: 'Honda',
      model: 'Rebel',
      odo: 1000,
      year: 2000,
    });

    const bikes = await listBikes(request, user_id);

    const bikeOneId = bikes[0].id;
    const bikeTwoId = bikes[1].id;

    const upsertResponse = await request.post(`${API_URL}/maintenance/upsert`, {
      data: {
        bike_id: bikeOneId,
        name: 'oil-change',
        date: '2026-03-16',
        odo: 500,
      },
    });

    expect(upsertResponse.status()).toBe(201);

    const upsertBody = await upsertResponse.json();

    expect(upsertBody.message).toBe('Maintenance created successfully');

    const bikeOneListResponse = await request.get(
      `${API_URL}/maintenance?bikeId=${bikeOneId}`,
    );

    expect(bikeOneListResponse.status()).toBe(200);

    const bikeOneListBody = await bikeOneListResponse.json();

    expect(bikeOneListBody.maintenance).toHaveLength(1);
    expect(bikeOneListBody.maintenance[0].bike_id).toBe(bikeOneId);
    expect(bikeOneListBody.maintenance[0].name).toBe('oil-change');

    const bikeTwoListResponse = await request.get(
      `${API_URL}/maintenance?bikeId=${bikeTwoId}`,
    );

    expect(bikeTwoListResponse.status()).toBe(200);

    const bikeTwoListBody = await bikeTwoListResponse.json();

    expect(bikeTwoListBody.maintenance).toHaveLength(0);
  });

  test('Logging one maintenance item does not affect another item', async ({
    request,
  }) => {
    await createBike(request, user_id);

    const bike_id = await getFirstBikeId(request, user_id);

    const oilResponse = await request.post(`${API_URL}/maintenance/upsert`, {
      data: {
        bike_id,
        name: 'oil-change',
        date: '2026-03-16',
        odo: 500,
      },
    });

    expect(oilResponse.status()).toBe(201);

    const oilBody = await oilResponse.json();

    expect(oilBody.message).toBe('Maintenance created successfully');

    const coolantResponse = await request.post(
      `${API_URL}/maintenance/upsert`,
      {
        data: {
          bike_id,
          name: 'coolant-change',
          date: '2026-03-17',
          odo: 1000,
        },
      },
    );

    expect(coolantResponse.status()).toBe(201);

    const coolantBody = await coolantResponse.json();

    expect(coolantBody.message).toBe('Maintenance created successfully');

    const bikeListResponse = await request.get(
      `${API_URL}/maintenance?bikeId=${bike_id}`,
    );

    expect(bikeListResponse.status()).toBe(200);

    const bikeListBody = await bikeListResponse.json();

    expect(bikeListBody.maintenance).toHaveLength(2);

    expect(bikeListBody.maintenance[0].bike_id).toBe(bike_id);
    expect(bikeListBody.maintenance[0].name).toBe('coolant-change');
    expect(bikeListBody.maintenance[0].date).toBe('2026-03-17');
    expect(bikeListBody.maintenance[0].odo).toBe(1000);

    expect(bikeListBody.maintenance[1].bike_id).toBe(bike_id);
    expect(bikeListBody.maintenance[1].name).toBe('oil-change');
    expect(bikeListBody.maintenance[1].date).toBe('2026-03-16');
    expect(bikeListBody.maintenance[1].odo).toBe(500);
  });
});
