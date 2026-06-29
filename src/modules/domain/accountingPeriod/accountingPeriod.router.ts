import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import {
  closeAccountingPeriod,
  createAccountingPeriod,
  getAccountingPeriodById,
  listAccountingPeriods,
  updateAccountingPeriod,
} from './accountingPeriod.controller.js';
import {
  accountingPeriodIdParamSchema,
  createAccountingPeriodBodySchema,
  listAccountingPeriodsQuerySchema,
  updateAccountingPeriodBodySchema,
} from './accountingPeriod.validator.js';

const accountingPeriodRouter = Router();

accountingPeriodRouter.post(
  '/',
  validate(createAccountingPeriodBodySchema, 'body'),
  createAccountingPeriod,
);
accountingPeriodRouter.get(
  '/',
  validate(listAccountingPeriodsQuerySchema, 'query'),
  listAccountingPeriods,
);
accountingPeriodRouter.get(
  '/:id',
  validate(accountingPeriodIdParamSchema, 'params'),
  getAccountingPeriodById,
);
accountingPeriodRouter.put(
  '/:id',
  validate(accountingPeriodIdParamSchema, 'params'),
  validate(updateAccountingPeriodBodySchema, 'body'),
  updateAccountingPeriod,
);
accountingPeriodRouter.patch(
  '/:id/close',
  validate(accountingPeriodIdParamSchema, 'params'),
  closeAccountingPeriod,
);

export default accountingPeriodRouter;
