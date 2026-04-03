import { msg } from '../../../constants/constants';
import type { AuthUser } from '../types/auth';

const AUTH_USER_KEY = 'motocaremaintenance.auth.user';

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
  if (!email) throw new Error(msg.EMAIL_REQ);

  const emailCheck = emailRegex.test(email);
  if (!emailCheck) throw new Error(msg.EMAIL_INVALID);

  const password: string = String(fd.get('password') ?? '').trim();
  if (!password) throw new Error(msg.PASS_REQ);

  return { email, password };
}

export function readRegForm(form: HTMLFormElement) {
  const fd = new FormData(form);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const email: string = String(fd.get('email') ?? '').trim();
  if (!email) throw new Error(msg.EMAIL_REQ);

  const emailCheck = emailRegex.test(email);
  if (!emailCheck) throw new Error(msg.EMAIL_INVALID);

  const password: string = String(fd.get('password') ?? '').trim();

  if (!password) throw new Error(msg.PASS_REQ);
  if (password.length < 8) throw new Error(msg.PASS_SHORT);
  if (password.length > 32) throw new Error(msg.PASS_LONG);

  const password2: string = String(fd.get('repeat-password') ?? '').trim();

  if (!password2) throw new Error(msg.PASS_CONF_REQ);
  if (password !== password2) throw new Error(msg.PASS_NO_MATCH);

  return { email, password };
}
