import {
  FAIL_CREATE_BIKE,
  FAIL_DELETE_BIKE,
  FAIL_FETCH_BIKES,
  FAIL_UPDATE_BIKE,
  INVALID_ODO,
  INVALID_YEAR,
  NO_BIKE,
  NO_USER,
  ODO_CANNOT_DECREASE,
  ODO_REQUIRED,
} from '../../../constants/constants';
import { getCurrentUser } from '../state/auth-store';
import { bikeStore } from '../state/bike-store';
import type {
  Bike,
  ListBikesResponse,
  ErrorResponse,
  CreateBikeResponse,
} from '../types/bikes';
import { API_BASE_URL } from './base';

export async function fetchBikes(): Promise<Bike[]> {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    throw new Error(NO_USER);
  }

  const response = await fetch(
    `${API_BASE_URL}/bikes?user_id=${encodeURIComponent(currentUser.id)}`,
  );

  const data = (await response.json()) as ListBikesResponse | ErrorResponse;

  if (!response.ok) {
    throw new Error('error' in data ? data.error : FAIL_FETCH_BIKES);
  }

  return (data as ListBikesResponse).bikes;
}

export async function createBikeApi(input: {
  make: string;
  model: string;
  year: number;
  odo: number;
}): Promise<CreateBikeResponse> {
  const currentUser = getCurrentUser();

  if (!currentUser) throw new Error(NO_USER);

  if (input.year !== undefined && (input.year < 1900 || input.year > 2100))
    throw new Error(INVALID_YEAR);

  if (input.odo < 0) throw new Error(INVALID_ODO);

  const response = await fetch(`${API_BASE_URL}/bikes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: currentUser.id,
      make: input.make,
      model: input.model,
      year: input.year,
      odo: input.odo,
    }),
  });

  const data = (await response.json()) as CreateBikeResponse | ErrorResponse;

  if (!response.ok) {
    throw new Error('error' in data ? data.error : FAIL_CREATE_BIKE);
  }

  return data as CreateBikeResponse;
}

export async function updateBikeApi(input: {
  id: string;
  make: string;
  model: string;
  year: number;
  odo: number;
}): Promise<{ message: string }> {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error(NO_USER);
  }

  const currentBike = bikeStore.getBike(input.id);
  if (!currentBike) throw new Error(NO_BIKE);

  if (input.year !== undefined && (input.year < 1900 || input.year > 2100)) {
    throw new Error(INVALID_YEAR);
  }

  if (input.odo === 0) {
    throw new Error(ODO_REQUIRED);
  }

  if (input.odo !== undefined && input.odo < currentBike.odo) {
    throw new Error(ODO_CANNOT_DECREASE);
  }

  const response = await fetch(
    `${API_BASE_URL}/bikes/${encodeURIComponent(input.id)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: currentUser.id,
        make: input.make,
        model: input.model,
        year: input.year,
        odo: input.odo,
      }),
    },
  );

  const data = (await response.json()) as { message: string } | ErrorResponse;

  if (!response.ok) {
    throw new Error('error' in data ? data.error : FAIL_UPDATE_BIKE);
  }

  return data as { message: string };
}

export async function deleteBikeApi(id: string): Promise<{ message: string }> {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    throw new Error(NO_USER);
  }

  const response = await fetch(
    `${API_BASE_URL}/bikes/${encodeURIComponent(id)}?user_id=${encodeURIComponent(currentUser.id)}`,
    {
      method: 'DELETE',
    },
  );

  const data = (await response.json()) as { message: string } | ErrorResponse;

  if (!response.ok) {
    throw new Error('error' in data ? data.error : FAIL_DELETE_BIKE);
  }

  return data as { message: string };
}
