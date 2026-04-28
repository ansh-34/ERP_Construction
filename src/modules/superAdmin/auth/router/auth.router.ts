import { Router } from 'express';

import { login } from '../controller/auth.controller';
import { validate } from '@/middlewares/validate';
import { loginData } from '../validator/auth.validator';

export const authRouter = Router();

authRouter.post('/login', validate(loginData, 'body'), login);

export default authRouter;
