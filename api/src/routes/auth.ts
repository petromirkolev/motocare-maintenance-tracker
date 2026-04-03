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
    sendAuthError(res, 400, msg.AUTH_FIELDS_REQ);
    return;
  }

  const email = normalizeEmail(validatedBody.email);
  const password = validatedBody.password;

  if (!isValidEmail(email)) {
    sendAuthError(res, 400, msg.AUTH_EMAIL_INVALID);
    return;
  }

  if (password.length < 8) {
    sendAuthError(res, 400, msg.AUTH_PASS_SHORT);
    return;
  }

  if (password.length > 32) {
    sendAuthError(res, 400, msg.AUTH_PASS_LONG);
    return;
  }

  try {
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      sendAuthError(res, 409, msg.AUTH_USER_EXISTS);
      return;
    }

    await createUser(email, password);
    sendRegisterSuccess(res, msg.AUTH_REG_OK);
  } catch (error) {
    console.error(msg.AUTH_REG_FAIL, error);
    sendAuthError(res, 500, msg.SYS_ERR_INTERNAL);
  }
});

authRouter.post('/login', async (req, res) => {
  const validatedBody = getValidatedAuthBody((req.body ?? {}) as AuthBody);

  if (!validatedBody) {
    sendAuthError(res, 400, msg.AUTH_FIELDS_REQ);
    return;
  }

  const email = normalizeEmail(validatedBody.email);
  const password = validatedBody.password;

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      sendAuthError(res, 401, msg.AUTH_CRED_INVALID);
      return;
    }

    const isPasswordValid = await verifyUserPassword(
      password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      sendAuthError(res, 401, msg.AUTH_CRED_INVALID);
      return;
    }

    sendLoginSuccess(res, msg.AUTH_LOGIN_OK, {
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error(msg.AUTH_LOGIN_FAIL, error);
    sendAuthError(res, 500, msg.SYS_ERR_INTERNAL);
  }
});

export default authRouter;
