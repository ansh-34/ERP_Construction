import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { adminUserTypeController } from './adminUserType.controller';
import { listAdminUserTypeQuery } from './adminUserType.validate';

const router = Router();

router.get(
  '/',
  validate(listAdminUserTypeQuery, 'query'),
  adminUserTypeController.list,
);

export default router;
