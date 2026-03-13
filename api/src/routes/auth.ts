import { Router } from 'express';
import {
  INTERNAL_SERVER_ERROR,
  INVALID_CREDENTIALS_ERROR,
  LOGIN_SUCCESS_MESSAGE,
  MISSING_AUTH_FIELDS_ERROR,
  REGISTER_SUCCESS_MESSAGE,
  USER_ALREADY_EXISTS_ERROR,
} from '../constants/auth';
import {
  createUser,
  findUserByEmail,
  verifyUserPassword,
} from '../services/auth-service';
import { AuthBody } from '../types/auth-body';
import { sendAuthError } from '../utils/auth-response';
import { sendLoginSuccess, sendRegisterSuccess } from '../utils/auth-success';
import { getValidatedAuthBody } from '../utils/auth-validation';
import { normalizeEmail, isValidEmail } from '../utils/validation';

const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const validatedBody = getValidatedAuthBody((req.body ?? {}) as AuthBody);

  if (!validatedBody) {
    sendAuthError(res, 400, MISSING_AUTH_FIELDS_ERROR);
    return;
  }

  const email = normalizeEmail(validatedBody.email);
  const password = validatedBody.password;

  if (!isValidEmail(email)) {
    sendAuthError(res, 400, 'Invalid email format');
    return;
  }

  if (password.length < 8) {
    sendAuthError(res, 400, 'Password must be at least 8 characters');
    return;
  }

  if (password.length > 32) {
    sendAuthError(res, 400, 'Password must be 32 characters at most');
    return;
  }

  try {
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      sendAuthError(res, 409, USER_ALREADY_EXISTS_ERROR);
      return;
    }

    await createUser(email, password);
    sendRegisterSuccess(res, REGISTER_SUCCESS_MESSAGE);
  } catch (error) {
    console.error('Register failed:', error);
    sendAuthError(res, 500, INTERNAL_SERVER_ERROR);
  }
});

authRouter.post('/login', async (req, res) => {
  const validatedBody = getValidatedAuthBody((req.body ?? {}) as AuthBody);

  if (!validatedBody) {
    sendAuthError(res, 400, MISSING_AUTH_FIELDS_ERROR);
    return;
  }

  const email = normalizeEmail(validatedBody.email);
  const password = validatedBody.password;

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      sendAuthError(res, 401, INVALID_CREDENTIALS_ERROR);
      return;
    }

    const isPasswordValid = await verifyUserPassword(
      password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      sendAuthError(res, 401, INVALID_CREDENTIALS_ERROR);
      return;
    }

    sendLoginSuccess(res, LOGIN_SUCCESS_MESSAGE, {
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error('Login failed:', error);
    sendAuthError(res, 500, INTERNAL_SERVER_ERROR);
  }
});

export default authRouter;
