import { Router } from 'express';
import validateSuperAdmin from '../../../middlewares/validateSuperAdmin.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createIndustryAccount,
  deleteIndustryAccount,
  getIndustryAccount,
  listIndustryAccounts,
  updateIndustryAccount,
} from './industryAccount.controller.js';
import {
  createIndustryAccountBodySchema,
  industryAccountIdParamsSchema,
  listIndustryAccountsQuerySchema,
  updateIndustryAccountBodySchema,
} from './industryAccount.validator.js';

const router = Router();
router.use(validateSuperAdmin);
router.post(
  '/',
  validate(createIndustryAccountBodySchema, 'body'),
  createIndustryAccount,
);
router.get(
  '/',
  validate(listIndustryAccountsQuerySchema, 'query'),
  listIndustryAccounts,
);
router.get(
  '/:id',
  validate(industryAccountIdParamsSchema, 'params'),
  getIndustryAccount,
);
router.put(
  '/:id',
  validate(industryAccountIdParamsSchema, 'params'),
  validate(updateIndustryAccountBodySchema, 'body'),
  updateIndustryAccount,
);
router.delete(
  '/:id',
  validate(industryAccountIdParamsSchema, 'params'),
  deleteIndustryAccount,
);

export default router;
