import { Router } from 'express';
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
  validate(listAccountBalanceQuerySchema, 'query'),
  listAccountBalances,
);
accountBalanceRouter.get(
  '/:id',
  validate(accountBalanceIdParamSchema, 'params'),
  getAccountBalanceById,
);

export default accountBalanceRouter;
