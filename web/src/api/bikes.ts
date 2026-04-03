import { msg } from '../../../constants/constants';
import { API_BASE_URL } from './base';
import { getCurrentUser } from '../state/auth-store';
import { bikeStore } from '../state/bike-store';
import type {
  Bike,
  ListBikesResponse,
  ErrorResponse,
  CreateBikeResponse,
} from '../types/bikes';

export async function fetchBikes(): Promise<Bike[]> {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    throw new Error(msg.USER_NOT_LOGGED);
  }

  const response = await fetch(
    `${API_BASE_URL}/bikes?user_id=${encodeURIComponent(currentUser.id)}`,
  );

  const data = (await response.json()) as ListBikesResponse | ErrorResponse;

  if (!response.ok) {
    throw new Error('error' in data ? data.error : msg.BIKE_FETCH_ERR);
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

  if (!currentUser) throw new Error(msg.USER_NOT_LOGGED);

  if (input.year !== undefined && (input.year < 1900 || input.year > 2100))
    throw new Error(msg.BIKE_YEAR_RANGE);

  if (input.odo < 0) throw new Error(msg.BIKE_ODO_POS);

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
    throw new Error('error' in data ? data.error : msg.BIKE_CREATE_ERR);
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
    throw new Error(msg.USER_NOT_LOGGED);
  }

  const currentBike = bikeStore.getBike(input.id);
  if (!currentBike) throw new Error(msg.BIKE_NOT_FOUND);

  if (input.year !== undefined && (input.year < 1900 || input.year > 2100)) {
    throw new Error(msg.BIKE_YEAR_RANGE);
  }

  if (input.odo === 0) {
    throw new Error(msg.BIKE_ODO_REQ);
  }

  if (input.odo !== undefined && input.odo < currentBike.odo) {
    throw new Error(msg.BIKE_ODO_DECR);
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
    throw new Error('error' in data ? data.error : msg.BIKE_UPDATE_ERR);
  }

  return data as { message: string };
}

export async function deleteBikeApi(id: string): Promise<{ message: string }> {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    throw new Error(msg.USER_NOT_LOGGED);
  }

  const response = await fetch(
    `${API_BASE_URL}/bikes/${encodeURIComponent(id)}?user_id=${encodeURIComponent(currentUser.id)}`,
    {
      method: 'DELETE',
    },
  );

  const data = (await response.json()) as { message: string } | ErrorResponse;

  if (!response.ok) {
    throw new Error('error' in data ? data.error : msg.BIKE_DELETE_ERR);
  }

  return data as { message: string };
}
