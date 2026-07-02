import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import { listIndustryAccounts } from './industryAccount.controller.js';
import { listIndustryAccountsQuerySchema } from './industryAccount.validator.js';

const router = Router();

router.get(
  '/',
  authorize('INDUSTRY_ACCOUNT', 'READ'),
  validate(listIndustryAccountsQuerySchema, 'query'),
  listIndustryAccounts,
);

export default router;
