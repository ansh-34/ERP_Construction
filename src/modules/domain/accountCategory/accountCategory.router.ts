import { Router } from 'express';
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
  validate(createAccountCategoryBodySchema, 'body'),
  createAccountCategory,
);
accountCategoryRouter.get(
  '/',
  validate(listAccountCategoriesQuerySchema, 'query'),
  listAccountCategories,
);
accountCategoryRouter.get(
  '/:id',
  validate(accountCategoryIdParamSchema, 'params'),
  getAccountCategoryById,
);
accountCategoryRouter.put(
  '/:id',
  validate(accountCategoryIdParamSchema, 'params'),
  validate(updateAccountCategoryBodySchema, 'body'),
  updateAccountCategory,
);
accountCategoryRouter.delete(
  '/:id',
  validate(accountCategoryIdParamSchema, 'params'),
  deleteAccountCategory,
);

export default accountCategoryRouter;
