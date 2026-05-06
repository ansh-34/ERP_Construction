import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { loginSuperAdmin } from './auth.controller.js';
import { superAdminLoginBodySchema } from './auth.validator.js';

const router = Router();

router.post(
  '/login',
  validate(superAdminLoginBodySchema, 'body'),
  loginSuperAdmin,
);

export default router;
