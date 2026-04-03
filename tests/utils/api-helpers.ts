import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { ValidBikeInput, BikeResponse } from '../types/bike';
import { ValidUserInput } from '../types/auth';
import { API_URL } from '../../constants/constants';
import {
  BikeUpdateInput,
  MaintenanceLogInput,
  MaintenanceScheduleInput,
} from '../types/maintenance';

export const api = {
  async registerUser(
    request: APIRequestContext,
    input: ValidUserInput,
  ): Promise<APIResponse> {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: {
        email: input.email,
        password: input.password,
      },
    });

    return response;
  },

  async loginUser(
    request: APIRequestContext,
    input: ValidUserInput,
  ): Promise<APIResponse> {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: input.email,
        password: input.password,
      },
    });

    return response;
  },

  async createBike(
    request: APIRequestContext,
    user_id: string,
    overrides: Partial<ValidBikeInput> = {},
  ): Promise<APIResponse> {
    const response = await request.post(`${API_URL}/bikes`, {
      data: {
        user_id,
        ...overrides,
      },
    });

    return response;
  },

  async updateBike(
    request: APIRequestContext,
    user_id: string,
    bike_id: string,
    overrides: Partial<BikeUpdateInput>,
  ): Promise<APIResponse> {
    const updateResponse = await request.put(`${API_URL}/bikes/${bike_id}`, {
      data: {
        id: bike_id,
        user_id,
        ...overrides,
      },
    });
    return updateResponse;
  },

  async deleteBike(
    request: APIRequestContext,
    user_id: string,
    bike_id: string,
  ): Promise<APIResponse> {
    const deleteResponse = await request.delete(
      `${API_URL}/bikes/${bike_id}?user_id=${user_id}`,
    );

    return deleteResponse;
  },

  async listFirstBike(
    request: APIRequestContext,
    user_id: string,
  ): Promise<BikeResponse> {
    const response = await request.get(`${API_URL}/bikes?user_id=${user_id}`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    return body.bikes[0];
  },

  async logMaintenance(
    request: APIRequestContext,
    bike_id: string,
    overrides: Partial<MaintenanceLogInput>,
  ) {
    const response = await request.post(`${API_URL}/maintenance/log`, {
      data: {
        bike_id,
        ...overrides,
      },
    });

    return response;
  },

  async scheduleMaintenance(
    request: APIRequestContext,
    bike_id: string,
    overrides: Partial<MaintenanceScheduleInput>,
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
  },

  async getMaintenance(
    request: APIRequestContext,
    bike_id: string,
  ): Promise<APIResponse> {
    const response = await request.get(
      `${API_URL}/maintenance?bike_id=${bike_id}`,
    );

    return response;
  },
};
