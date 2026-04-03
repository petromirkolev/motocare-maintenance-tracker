import { test, expect } from '../fixtures/api-fixtures';
import { api } from '../utils/api-helpers';
import { msg } from '../../constants/constants';

test.describe('Maintenance API test suite', () => {
  test('Maintenance log with valid date/odo succeeds', async ({
    request,
    userWithOneBike,
    maintenanceLogInput,
  }) => {
    const logResponse = await api.logMaintenance(
      request,
      userWithOneBike.bike_id,
      maintenanceLogInput,
    );
    expect(logResponse.status()).toBe(201);

    const logBody = await logResponse.json();
    expect(logBody.message).toBe(msg.MAINT_CREATE_OK);

    const jobResponse = await api.getMaintenance(
      request,
      userWithOneBike.bike_id,
    );
    expect(jobResponse.status()).toBe(200);

    const jobBody = await jobResponse.json();
    const maintenance = jobBody.maintenance[0];

    expect(jobBody.maintenance).toHaveLength(1);
    expect(maintenance.bike_id).toBe(userWithOneBike.bike_id);
    expect(maintenance.name).toBe(maintenanceLogInput.name);
    expect(maintenance.date).toBe(maintenanceLogInput.date);
    expect(maintenance.odo).toBe(maintenanceLogInput.odo);
  });

  test('Maintenance log with negative odo is rejected', async ({
    request,
    userWithOneBike,
    maintenanceLogInput,
  }) => {
    const logResponse = await api.logMaintenance(
      request,
      userWithOneBike.bike_id,
      {
        ...maintenanceLogInput,
        odo: -500,
      },
    );
    expect(logResponse.status()).toBe(400);

    const upsertBody = await logResponse.json();
    expect(upsertBody.error).toBe(msg.BIKE_ODO_POS);
  });

  test('Maintenance log for bike A does not affect bike B', async ({
    request,
    userWithOneBike,
    validBikeInput,
    maintenanceLogInput,
  }) => {
    const bike_2_response = await api.createBike(
      request,
      userWithOneBike.user_id,
      { ...validBikeInput, make: 'Suzuki' },
    );
    const bike_2_body = await bike_2_response.json();
    const bike_2_id = bike_2_body.bike.id;
    const logResponse = await api.logMaintenance(
      request,
      userWithOneBike.bike_id,
      maintenanceLogInput,
    );
    expect(logResponse.status()).toBe(201);

    const logBody = await logResponse.json();
    expect(logBody.message).toBe(msg.MAINT_CREATE_OK);

    const bike_1_maintenance = await api.getMaintenance(
      request,
      userWithOneBike.bike_id,
    );
    expect(bike_1_maintenance.status()).toBe(200);

    const bike_1_maintenance_body = await bike_1_maintenance.json();
    const bike_1_maintenance_records = bike_1_maintenance_body.maintenance[0];

    expect(bike_1_maintenance_body.maintenance).toHaveLength(1);
    expect(bike_1_maintenance_records.bike_id).toBe(userWithOneBike.bike_id);
    expect(bike_1_maintenance_records.name).toBe(maintenanceLogInput.name);

    const bike_2_maintenance = await api.getMaintenance(request, bike_2_id);
    expect(bike_2_maintenance.status()).toBe(200);

    const bike_2_maintenance_body = await bike_2_maintenance.json();
    expect(bike_2_maintenance_body.maintenance).toHaveLength(0);
  });

  test('Logging one maintenance item does not affect another item', async ({
    request,
    userWithOneBike,
    maintenanceLogInput,
  }) => {
    const oilResponse = await api.logMaintenance(
      request,
      userWithOneBike.bike_id,
      { ...maintenanceLogInput },
    );
    expect(oilResponse.status()).toBe(201);

    const oilBody = await oilResponse.json();
    expect(oilBody.message).toBe(msg.MAINT_CREATE_OK);

    const coolantResponse = await api.logMaintenance(
      request,
      userWithOneBike.bike_id,
      { ...maintenanceLogInput, name: 'coolant-change' },
    );
    expect(coolantResponse.status()).toBe(201);

    const coolantBody = await coolantResponse.json();
    expect(coolantBody.message).toBe(msg.MAINT_CREATE_OK);

    const maintenanceResponse = await api.getMaintenance(
      request,
      userWithOneBike.bike_id,
    );
    expect(maintenanceResponse.status()).toBe(200);

    const maintenanceBody = await maintenanceResponse.json();
    const coolantMaintenance = maintenanceBody.maintenance[0];
    const oilMaintenance = maintenanceBody.maintenance[1];

    expect(maintenanceBody.maintenance).toHaveLength(2);

    expect(oilMaintenance.bike_id).toBe(userWithOneBike.bike_id);
    expect(oilMaintenance.name).toBe(maintenanceLogInput.name);
    expect(oilMaintenance.date).toBe(maintenanceLogInput.date);
    expect(oilMaintenance.odo).toBe(maintenanceLogInput.odo);

    expect(coolantMaintenance.bike_id).toBe(userWithOneBike.bike_id);
    expect(coolantMaintenance.name).toBe('coolant-change');
    expect(coolantMaintenance.date).toBe(maintenanceLogInput.date);
    expect(coolantMaintenance.odo).toBe(maintenanceLogInput.odo);
  });

  test('Maintenance schedule with valid days/km succeeds', async ({
    request,
    userWithOneBike,
    maintenanceScheduleInput,
  }) => {
    const logResponse = await api.scheduleMaintenance(
      request,
      userWithOneBike.bike_id,
      { ...maintenanceScheduleInput },
    );
    expect(logResponse.status()).toBe(201);

    const logBody = await logResponse.json();
    expect(logBody.message).toBe(msg.MAINT_SCHED_OK);

    const getResponse = await api.getMaintenance(
      request,
      userWithOneBike.bike_id,
    );
    expect(getResponse.status()).toBe(200);

    const getBody = await getResponse.json();

    expect(getBody.maintenance).toHaveLength(1);
    expect(getBody.maintenance[0].bike_id).toBe(userWithOneBike.bike_id);
    expect(getBody.maintenance[0].name).toBe(maintenanceScheduleInput.name);
    expect(getBody.maintenance[0].interval_km).toBe(
      maintenanceScheduleInput.interval_km,
    );
    expect(getBody.maintenance[0].interval_days).toBe(
      maintenanceScheduleInput.interval_days,
    );
  });

  test('Maintenance schedule with missing days is rejected', async ({
    request,
    userWithOneBike,
    maintenanceScheduleInput,
  }) => {
    const logResponse = await api.scheduleMaintenance(
      request,
      userWithOneBike.bike_id,
      { ...maintenanceScheduleInput, interval_days: undefined },
    );
    expect(logResponse.status()).toBe(400);

    const logBody = await logResponse.json();
    expect(logBody.error).toBe(msg.MAINT_DAYS_REQ);
  });

  test('Maintenance schedule with missing kilometers is rejected', async ({
    request,
    userWithOneBike,
    maintenanceScheduleInput,
  }) => {
    const logResponse = await api.scheduleMaintenance(
      request,
      userWithOneBike.bike_id,
      {
        ...maintenanceScheduleInput,
        interval_km: undefined,
      },
    );
    expect(logResponse.status()).toBe(400);

    const logBody = await logResponse.json();
    expect(logBody.error).toBe(msg.MAINT_KM_REQ);
  });

  test('Maintenance schedule for bike A does not affect bike B', async ({
    request,
    userWithOneBike,
    maintenanceScheduleInput,
    validBikeInput,
  }) => {
    const bike_2 = await api.createBike(request, userWithOneBike.user_id, {
      ...validBikeInput,
      make: 'Suzuki',
    });
    const bike_2_body = await bike_2.json();
    const bike_2_id = bike_2_body.bike.id;
    const schedule_oil_service_bike_1 = await api.scheduleMaintenance(
      request,
      userWithOneBike.bike_id,
      { ...maintenanceScheduleInput },
    );
    expect(schedule_oil_service_bike_1.status()).toBe(201);

    const oil_service_bike_1_body = await schedule_oil_service_bike_1.json();
    expect(oil_service_bike_1_body.message).toBe(msg.MAINT_SCHED_OK);

    const bike_1_maintenance = await api.getMaintenance(
      request,
      userWithOneBike.bike_id,
    );
    expect(bike_1_maintenance.status()).toBe(200);

    const bike_1_records = await bike_1_maintenance.json();
    expect(bike_1_records.maintenance).toHaveLength(1);
    expect(bike_1_records.maintenance[0].name).toBe(
      maintenanceScheduleInput.name,
    );

    const schedule_coolant_service_bike_2 = await api.scheduleMaintenance(
      request,
      bike_2_id,
      { ...maintenanceScheduleInput, name: 'coolant-change' },
    );
    expect(schedule_oil_service_bike_1.status()).toBe(201);

    const coolant_service_bike_2_body =
      await schedule_coolant_service_bike_2.json();
    expect(coolant_service_bike_2_body.message).toBe(msg.MAINT_SCHED_OK);

    const bike_2_maintenance = await api.getMaintenance(request, bike_2_id);
    expect(bike_2_maintenance.status()).toBe(200);

    const bike_2_records = await bike_2_maintenance.json();
    expect(bike_2_records.maintenance).toHaveLength(1);
    expect(bike_2_records.maintenance[0].name).toBe('coolant-change');
  });
});
