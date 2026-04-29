import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { loginSuperadmin } from './auth.controller.js';
import { superadminLoginBodySchema } from './auth.validator.js';

const router = Router();

router.post(
  '/login',
  validate(superadminLoginBodySchema, 'body'),
  loginSuperadmin,
);

export default router;
