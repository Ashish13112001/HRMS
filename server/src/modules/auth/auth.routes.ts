import { Router } from 'express';
import { validateBody } from '../../middleware/validate.js';
import { login, refresh, register } from './auth.controller.js';
import { loginSchema, refreshTokenSchema, registerSchema } from './auth.schema.js';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), register);
authRouter.post('/login', validateBody(loginSchema), login);
authRouter.post('/refresh', validateBody(refreshTokenSchema), refresh);
