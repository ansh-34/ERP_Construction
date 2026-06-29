import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createAccount,
  deleteAccount,
  getAccountById,
  listAccounts,
  updateAccount,
} from './account.controller.js';
import {
  accountIdParamSchema,
  createAccountBodySchema,
  listAccountsQuerySchema,
  updateAccountBodySchema,
} from './account.validator.js';

const accountRouter = Router();

accountRouter.post(
  '/',
  authorize('ACCOUNT', 'CREATE'),
  validate(createAccountBodySchema, 'body'),
  createAccount,
);
accountRouter.get(
  '/',
  authorize('ACCOUNT', 'READ'),
  validate(listAccountsQuerySchema, 'query'),
  listAccounts,
);
accountRouter.get(
  '/:id',
  authorize('ACCOUNT', 'READ'),
  validate(accountIdParamSchema, 'params'),
  getAccountById,
);
accountRouter.put(
  '/:id',
  authorize('ACCOUNT', 'UPDATE'),
  validate(accountIdParamSchema, 'params'),
  validate(updateAccountBodySchema, 'body'),
  updateAccount,
);
accountRouter.delete(
  '/:id',
  authorize('ACCOUNT', 'DELETE'),
  validate(accountIdParamSchema, 'params'),
  deleteAccount,
);

export default accountRouter;
