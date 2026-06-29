import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createAccountCategory,
  deleteAccountCategory,
  getAccountCategoryById,
  listAccountCategories,
  updateAccountCategory,
} from './accountCategory.controller.js';
import {
  accountCategoryIdParamSchema,
  createAccountCategoryBodySchema,
  listAccountCategoriesQuerySchema,
  updateAccountCategoryBodySchema,
} from './accountCategory.validator.js';

const accountCategoryRouter = Router();

accountCategoryRouter.post(
  '/',
  authorize('ACCOUNT_CATEGORY', 'CREATE'),
  validate(createAccountCategoryBodySchema, 'body'),
  createAccountCategory,
);
accountCategoryRouter.get(
  '/',
  authorize('ACCOUNT_CATEGORY', 'READ'),
  validate(listAccountCategoriesQuerySchema, 'query'),
  listAccountCategories,
);
accountCategoryRouter.get(
  '/:id',
  authorize('ACCOUNT_CATEGORY', 'READ'),
  validate(accountCategoryIdParamSchema, 'params'),
  getAccountCategoryById,
);
accountCategoryRouter.put(
  '/:id',
  authorize('ACCOUNT_CATEGORY', 'UPDATE'),
  validate(accountCategoryIdParamSchema, 'params'),
  validate(updateAccountCategoryBodySchema, 'body'),
  updateAccountCategory,
);
accountCategoryRouter.delete(
  '/:id',
  authorize('ACCOUNT_CATEGORY', 'DELETE'),
  validate(accountCategoryIdParamSchema, 'params'),
  deleteAccountCategory,
);

export default accountCategoryRouter;
