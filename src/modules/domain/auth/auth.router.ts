import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { login } from './auth.controller.js';
import validateSuperAdmin from '../../../middlewares/validateSuperAdmin.js';
import { loginBodySchema } from './auth.validator.js';

const router = Router();

router.post('/login', validate(loginBodySchema, 'body'), login);

export default router;
