import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { listIndustryAccounts } from './industryAccount.controller.js';
import { listIndustryAccountsQuerySchema } from './industryAccount.validator.js';

const router = Router();

router.get(
  '/',
  validate(listIndustryAccountsQuerySchema, 'query'),
  listIndustryAccounts,
);

export default router;
