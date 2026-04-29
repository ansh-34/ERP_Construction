import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { login } from './auth.controller.js';
import validateSuperadmin from '../../../middlewares/validateSuperadmin.js';
import { loginBodySchema } from './auth.validator.js';

const router = Router();

router.post('/login', validate(loginBodySchema, 'body'), login);

export default router;
