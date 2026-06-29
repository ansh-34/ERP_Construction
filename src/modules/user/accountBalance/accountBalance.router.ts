import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  getAccountBalanceById,
  listAccountBalances,
} from './accountBalance.controller.js';
import {
  accountBalanceIdParamSchema,
  listAccountBalanceQuerySchema,
} from './accountBalance.validator.js';

const accountBalanceRouter = Router();

accountBalanceRouter.get(
  '/',
  authorize('ACCOUNT_BALANCE', 'READ'),
  validate(listAccountBalanceQuerySchema, 'query'),
  listAccountBalances,
);
accountBalanceRouter.get(
  '/:id',
  authorize('ACCOUNT_BALANCE', 'READ'),
  validate(accountBalanceIdParamSchema, 'params'),
  getAccountBalanceById,
);

export default accountBalanceRouter;
