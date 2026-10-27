import { Router } from 'express';
import { validateBody } from '../../middleware/validate.js';
import { register } from './auth.controller.js';
import { registerSchema } from './auth.schema.js';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), register);
