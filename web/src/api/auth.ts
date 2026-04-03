import { API_BASE_URL } from './base';
import { msg } from '../../../constants/constants';
import type {
  RegisterResponse,
  ErrorResponse,
  LoginResponse,
} from '../types/auth';

export async function registerUser(
  email: string,
  password: string,
): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = (await response.json()) as RegisterResponse | ErrorResponse;

  if (!response.ok) {
    throw new Error('error' in data ? data.error : msg.USER_REG_ERR);
  }

  return data as RegisterResponse;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = (await response.json()) as LoginResponse | ErrorResponse;

  if (!response.ok) {
    throw new Error('error' in data ? data.error : msg.USER_LOG_ERR);
  }

  return data as LoginResponse;
}
