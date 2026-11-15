import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validateBody } from '../../middleware/validate.js';
import {
  forgotPassword,
  getMe,
  login,
  logout,
  refresh,
  register,
  resetPassword,
} from './auth.controller.js';
import {
  forgotPasswordSchema,
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
} from './auth.schema.js';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), register);
authRouter.post('/login', validateBody(loginSchema), login);
authRouter.post('/logout', validateBody(logoutSchema), logout);
authRouter.post('/refresh', validateBody(refreshTokenSchema), refresh);
authRouter.post('/forgot-password', validateBody(forgotPasswordSchema), forgotPassword);
authRouter.post('/reset-password', validateBody(resetPasswordSchema), resetPassword);
authRouter.get('/me', authenticate, getMe);
