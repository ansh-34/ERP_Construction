import { Router } from 'express';
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
  validate(createAccountBodySchema, 'body'),
  createAccount,
);
accountRouter.get(
  '/',
  validate(listAccountsQuerySchema, 'query'),
  listAccounts,
);
accountRouter.get(
  '/:id',
  validate(accountIdParamSchema, 'params'),
  getAccountById,
);
accountRouter.put(
  '/:id',
  validate(accountIdParamSchema, 'params'),
  validate(updateAccountBodySchema, 'body'),
  updateAccount,
);
accountRouter.delete(
  '/:id',
  validate(accountIdParamSchema, 'params'),
  deleteAccount,
);

export default accountRouter;
