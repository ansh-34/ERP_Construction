import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createAccountingPeriod,
  getAccountingPeriodById,
  listAccountingPeriods,
  updateAccountingPeriod,
} from '../../domain/accountingPeriod/accountingPeriod.controller.js';
import {
  accountingPeriodIdParamSchema,
  createAccountingPeriodBodySchema,
  listAccountingPeriodsQuerySchema,
  updateAccountingPeriodBodySchema,
} from '../../domain/accountingPeriod/accountingPeriod.validator.js';
import { closeAccountingPeriodAsUser } from './accountingPeriod.controller.js';

const router = Router();

router.post(
  '/',
  authorize('ACCOUNTING_PERIOD', 'CREATE'),
  validate(createAccountingPeriodBodySchema, 'body'),
  createAccountingPeriod,
);
router.get(
  '/',
  authorize('ACCOUNTING_PERIOD', 'READ'),
  validate(listAccountingPeriodsQuerySchema, 'query'),
  listAccountingPeriods,
);
router.get(
  '/:id',
  authorize('ACCOUNTING_PERIOD', 'READ'),
  validate(accountingPeriodIdParamSchema, 'params'),
  getAccountingPeriodById,
);
router.put(
  '/:id',
  authorize('ACCOUNTING_PERIOD', 'UPDATE'),
  validate(accountingPeriodIdParamSchema, 'params'),
  validate(updateAccountingPeriodBodySchema, 'body'),
  updateAccountingPeriod,
);
router.patch(
  '/:id/close',
  authorize('ACCOUNTING_PERIOD', 'CLOSE'),
  validate(accountingPeriodIdParamSchema, 'params'),
  closeAccountingPeriodAsUser,
);

export default router;
