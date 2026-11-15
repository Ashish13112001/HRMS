import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { validateBody } from '../../middleware/validate.js';
import { getMe, login, logout, refresh, register } from './auth.controller.js';
import {
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
} from './auth.schema.js';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), register);
authRouter.post('/login', validateBody(loginSchema), login);
authRouter.post('/logout', validateBody(logoutSchema), logout);
authRouter.post('/refresh', validateBody(refreshTokenSchema), refresh);
authRouter.get('/me', authenticate, getMe);
