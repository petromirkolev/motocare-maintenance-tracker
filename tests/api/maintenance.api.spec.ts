import { test, expect, APIRequestContext, APIResponse } from '@playwright/test';
import { uniqueEmail, API_URL, PASSWORD } from '../utils/test-data';

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
): Promise<APIResponse> {
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

  return response;
}

async function listFirstBike(
  request: APIRequestContext,
  user_id: string,
): Promise<any> {
  const response = await request.get(`${API_URL}/bikes?user_id=${user_id}`);

  expect(response.status()).toBe(200);

  const body = await response.json();
  return body.bikes[0];
}

async function scheduleMaintenance(
  request: APIRequestContext,
  bike_id: string,
  overrides: Partial<{
    name: 'oil-change' | 'coolant-change';
    interval_km: number;
    interval_days: number;
  }>,
) {
  const response = await request.post(`${API_URL}/maintenance/schedule`, {
    data: {
      bike_id,
      name: overrides.name,
      interval_km: overrides.interval_km,
      interval_days: overrides.interval_days,
    },
  });

  return response;
}

async function getMaintenance(
  request: APIRequestContext,
  bike_id: string,
): Promise<APIResponse> {
  const response = await request.get(
    `${API_URL}/maintenance?bike_id=${bike_id}`,
  );

  return response;
}

test.describe('Maintenance API test suite', () => {
  let email: string;
  let user_id: string;
  let bike_id: string;

  test.beforeEach(async ({ request }) => {
    email = uniqueEmail('api-maintenance');
    await registerUser(request, email);
    const body = await loginUser(request, email);
    user_id = body.user.id;
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
      `${API_URL}/maintenance?bike_id=${bike_id}`,
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

    expect(upsertBody.error).toBe('odo must be a non-negative integer');
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
      `${API_URL}/maintenance?bike_id=${bikeOneId}`,
    );

    expect(bikeOneListResponse.status()).toBe(200);

    const bikeOneListBody = await bikeOneListResponse.json();

    expect(bikeOneListBody.maintenance).toHaveLength(1);
    expect(bikeOneListBody.maintenance[0].bike_id).toBe(bikeOneId);
    expect(bikeOneListBody.maintenance[0].name).toBe('oil-change');

    const bikeTwoListResponse = await request.get(
      `${API_URL}/maintenance?bike_id=${bikeTwoId}`,
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
      `${API_URL}/maintenance?bike_id=${bike_id}`,
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

  test('Maintenance schedule with valid days/km succeeds', async ({
    request,
  }) => {
    const bikeResponse = await createBike(request, user_id);
    const body = await bikeResponse.json();
    bike_id = body.bike.id;

    const logResponse = await scheduleMaintenance(request, bike_id, {
      name: 'oil-change',
      interval_km: 1000,
      interval_days: 100,
    });

    expect(logResponse.status()).toBe(201);

    const logBody = await logResponse.json();

    expect(logBody.message).toBe('Maintenance scheduled successfully');

    const getResponse = await getMaintenance(request, bike_id);

    expect(getResponse.status()).toBe(200);

    const getBody = await getResponse.json();

    expect(getBody.maintenance).toHaveLength(1);
    expect(getBody.maintenance[0].bike_id).toBe(bike_id);
    expect(getBody.maintenance[0].name).toBe('oil-change');
    expect(getBody.maintenance[0].interval_km).toBe(1000);
    expect(getBody.maintenance[0].interval_days).toBe(100);
  });

  test('Maintenance schedule with missing days is rejected', async ({
    request,
  }) => {
    const bikeResponse = await createBike(request, user_id);
    const body = await bikeResponse.json();
    bike_id = body.bike.id;

    const logResponse = await scheduleMaintenance(request, bike_id, {
      name: 'oil-change',
      interval_km: 1000,
    });

    expect(logResponse.status()).toBe(400);

    const logBody = await logResponse.json();

    expect(logBody.error).toBe('interval_days is required');
  });

  test('Maintenance schedule with missing kilometers is rejected', async ({
    request,
  }) => {
    const bikeResponse = await createBike(request, user_id);
    const body = await bikeResponse.json();
    bike_id = body.bike.id;

    const logResponse = await scheduleMaintenance(request, bike_id, {
      name: 'oil-change',
      interval_km: 1000,
    });

    expect(logResponse.status()).toBe(400);

    const logBody = await logResponse.json();

    expect(logBody.error).toBe('interval_km is required');
  });

  test('Maintenance schedule for bike A does not affect bike B', async ({
    request,
  }) => {
    const bikeOneResponse = await createBike(request, user_id);
    const bikeOneBody = await bikeOneResponse.json();
    const bike_one_id = bikeOneBody.bike.id;

    const bikeTwoResponse = await createBike(request, user_id, {
      make: 'Honda',
      model: 'Rebel',
      odo: 1000,
      year: 2000,
    });
    const bikeTwoBody = await bikeOneResponse.json();
    const bike_two_id = bikeTwoBody.bike.id;

    const bikeOneLogResponse = await 



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
      `${API_URL}/maintenance?bike_id=${bikeOneId}`,
    );

    expect(bikeOneListResponse.status()).toBe(200);

    const bikeOneListBody = await bikeOneListResponse.json();

    expect(bikeOneListBody.maintenance).toHaveLength(1);
    expect(bikeOneListBody.maintenance[0].bike_id).toBe(bikeOneId);
    expect(bikeOneListBody.maintenance[0].name).toBe('oil-change');
    expect(bikeOneListBody.maintenance[0].interval_km).toBe(1000);
    expect(bikeOneListBody.maintenance[0].interval_days).toBe(100);

    const bikeTwoListResponse = await request.get(
      `${API_URL}/maintenance?bike_id=${bikeTwoId}`,
    );

    expect(bikeTwoListResponse.status()).toBe(200);

    const bikeTwoListBody = await bikeTwoListResponse.json();

    expect(bikeTwoListBody.maintenance).toHaveLength(0);
  });
});
