import { test, expect } from '../fixtures/api-fixtures';
import { api } from '../utils/api-helpers';
import { msg } from '../../constants/constants';

test.describe('Garage API test suite', () => {
  test('Create bike with valid data succeeds', async ({
    request,
    loggedInUser,
    validBikeInput,
  }) => {
    const response = await api.createBike(
      request,
      loggedInUser.user_id,
      validBikeInput,
    );
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.message).toBe(msg.BIKE_CREATE_OK);
  });

  test('Create bike with invalid year above maximum is rejected', async ({
    request,
    loggedInUser,
    validBikeInput,
    invalidBikeInput,
  }) => {
    const response = await api.createBike(request, loggedInUser.user_id, {
      ...validBikeInput,
      year: invalidBikeInput.yearAbove,
    });
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe(msg.BIKE_YEAR_RANGE);
  });

  test('Create bike with invalid year below minimum is rejected', async ({
    request,
    loggedInUser,
    validBikeInput,
    invalidBikeInput,
  }) => {
    const response = await api.createBike(request, loggedInUser.user_id, {
      ...validBikeInput,
      year: invalidBikeInput.yearBelow,
    });
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe(msg.BIKE_YEAR_RANGE);
  });

  test('Create bike with negative odometer is rejected', async ({
    request,
    loggedInUser,
    validBikeInput,
    invalidBikeInput,
  }) => {
    const response = await api.createBike(request, loggedInUser.user_id, {
      ...validBikeInput,
      odo: invalidBikeInput.odo,
    });
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.error).toBe(msg.BIKE_ODO_POS);
  });

  test('Update bike with valid data succeeds', async ({
    request,
    userWithOneBike,
    validBikeUpdateInput,
  }) => {
    const updateResponse = await api.updateBike(
      request,
      userWithOneBike.user_id,
      userWithOneBike.bike_id,
      validBikeUpdateInput,
    );
    expect(updateResponse.status()).toBe(200);

    const updateBody = await updateResponse.json();
    expect(updateBody.message).toBe(msg.BIKE_UPDATE_OK);

    const bike = await api.listFirstBike(request, userWithOneBike.user_id);
    expect(bike.make).toBe(validBikeUpdateInput.make);
    expect(bike.model).toBe(validBikeUpdateInput.model);
    expect(bike.year).toBe(validBikeUpdateInput.year);
    expect(bike.odo).toBe(validBikeUpdateInput.odo);
  });

  test('Update bike with lower odometer is rejected', async ({
    request,
    userWithOneBike,
    validBikeUpdateInput,
  }) => {
    const updateResponse = await api.updateBike(
      request,
      userWithOneBike.user_id,
      userWithOneBike.bike_id,
      { ...validBikeUpdateInput, odo: validBikeUpdateInput.odo - 100 },
    );
    expect(updateResponse.status()).toBe(400);

    const updateBody = await updateResponse.json();
    expect(updateBody.error).toBe(msg.BIKE_ODO_DECR);
  });

  test('Delete bike succeeds', async ({ request, userWithOneBike }) => {
    const deleteResponse = await api.deleteBike(
      request,
      userWithOneBike.user_id,
      userWithOneBike.bike_id,
    );
    expect(deleteResponse.status()).toBe(200);

    const deleteBody = await deleteResponse.json();
    expect(deleteBody.message).toBe(msg.BIKE_DELETE_OK);

    const bike = await api.listFirstBike(request, userWithOneBike.user_id);
    expect(bike).toBeUndefined();
  });
});
