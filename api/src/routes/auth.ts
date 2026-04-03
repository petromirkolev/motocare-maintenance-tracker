import { Router } from 'express';
import { msg } from '../constants/constants';
import { AuthBody } from '../types/auth-body';
import { sendAuthError } from '../utils/auth-response';
import { sendLoginSuccess, sendRegisterSuccess } from '../utils/auth-success';
import { getValidatedAuthBody } from '../utils/auth-validation';
import { normalizeEmail, isValidEmail } from '../utils/validation';
import {
  createUser,
  findUserByEmail,
  verifyUserPassword,
} from '../services/auth-service';

const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const validatedBody = getValidatedAuthBody((req.body ?? {}) as AuthBody);

  if (!validatedBody) {
    sendAuthError(res, 400, msg.MISSING_AUTH_FIELDS);
    return;
  }

  const email = normalizeEmail(validatedBody.email);
  const password = validatedBody.password;

  if (!isValidEmail(email)) {
    sendAuthError(res, 400, msg.INVALID_EMAIL_FORMAT);
    return;
  }

  if (password.length < 8) {
    sendAuthError(res, 400, msg.PASS_SHORT);
    return;
  }

  if (password.length > 32) {
    sendAuthError(res, 400, msg.PASS_LONG);
    return;
  }

  try {
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      sendAuthError(res, 409, msg.USER_ALREADY_EXISTS);
      return;
    }

    await createUser(email, password);
    sendRegisterSuccess(res, msg.REG_SUCCESS);
  } catch (error) {
    console.error(msg.REG_FAIL, error);
    sendAuthError(res, 500, msg.INTERNAL_SERVER_ERROR);
  }
});

authRouter.post('/login', async (req, res) => {
  const validatedBody = getValidatedAuthBody((req.body ?? {}) as AuthBody);

  if (!validatedBody) {
    sendAuthError(res, 400, msg.MISSING_AUTH_FIELDS);
    return;
  }

  const email = normalizeEmail(validatedBody.email);
  const password = validatedBody.password;

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      sendAuthError(res, 401, msg.INVALID_CREDENTIALS);
      return;
    }

    const isPasswordValid = await verifyUserPassword(
      password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      sendAuthError(res, 401, msg.INVALID_CREDENTIALS);
      return;
    }

    sendLoginSuccess(res, msg.LOGIN_SUCCESS, {
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error(msg.LOGIN_FAIL, error);
    sendAuthError(res, 500, msg.INTERNAL_SERVER_ERROR);
  }
});

export default authRouter;
