/* Auth store is responsible for the app users functions */

import type { AuthUser } from '../types/auth';

const AUTH_USER_KEY = 'motocare.auth.user';

let currentUser: AuthUser | null = readStoredUser();

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(AUTH_USER_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: AuthUser | null): void {
  currentUser = user;

  if (!user) {
    localStorage.removeItem(AUTH_USER_KEY);
    return;
  }

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function getCurrentUser(): AuthUser | null {
  return currentUser;
}

export function readLoginForm(form: HTMLFormElement) {
  const fd = new FormData(form);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const email: string = String(fd.get('email') ?? '').trim();
  if (!email) throw new Error('Email is required');

  const emailCheck = emailRegex.test(email);
  if (!emailCheck) throw new Error('Invalid email format');

  const password: string = String(fd.get('password') ?? '').trim();
  if (!password) throw new Error('Password is required');

  return { email, password };
}

export function readRegForm(form: HTMLFormElement) {
  const fd = new FormData(form);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const email: string = String(fd.get('email') ?? '').trim();
  if (!email) throw new Error('Email is required');

  const emailCheck = emailRegex.test(email);
  if (!emailCheck) throw new Error('Invalid email format');

  const password: string = String(fd.get('password') ?? '').trim();
  if (!password) throw new Error('Password is required');

  if (password.length < 8)
    throw new Error('Password must be 8 characters at minimum');

  if (password.length > 32)
    throw new Error('Password must be 32 characters at maximum');

  const password2: string = String(fd.get('repeat-password') ?? '').trim();
  if (!password2) throw new Error('Confirm password is required');

  if (password !== password2) throw new Error('Passwords do not match');

  return { email, password };
}
