import { API_BASE_URL } from './base';
import { messages } from '../../../constants/messages';
import type {
  RegisterResponse,
  AuthErrorResponse,
  LoginResponse,
} from '../types/index';

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

  const data = (await response.json()) as RegisterResponse | AuthErrorResponse;

  if (!response.ok) {
    throw new Error('error' in data ? data.error : messages.AUTH_REG_FAIL);
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

  const data = (await response.json()) as LoginResponse | AuthErrorResponse;

  if (!response.ok) {
    throw new Error('error' in data ? data.error : messages.AUTH_LOGIN_FAIL);
  }

  return data as LoginResponse;
}
