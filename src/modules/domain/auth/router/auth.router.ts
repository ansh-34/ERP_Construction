import { Router } from 'express';

import { login, userLogin } from '../controller/auth.controller';
import { validate } from '@/middlewares/validate';
import { loginData, userLoginData } from '../validator/auth.validator';

export const authRouter = Router();

authRouter.post('/login', validate(loginData, 'body'), login);
authRouter.post('/user-login', validate(userLoginData, 'body'), userLogin);

export default authRouter;
