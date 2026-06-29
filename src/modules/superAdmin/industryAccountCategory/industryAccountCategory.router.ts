import { Router } from 'express';
import validateSuperAdmin from '../../../middlewares/validateSuperAdmin.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createIndustryAccountCategory,
  deleteIndustryAccountCategory,
  getIndustryAccountCategory,
  listIndustryAccountCategories,
  updateIndustryAccountCategory,
} from './industryAccountCategory.controller.js';
import {
  createIndustryAccountCategoryBodySchema,
  industryAccountCategoryIdParamsSchema,
  listIndustryAccountCategoriesQuerySchema,
  updateIndustryAccountCategoryBodySchema,
} from './industryAccountCategory.validator.js';

const router = Router();
router.use(validateSuperAdmin);
router.post(
  '/',
  validate(createIndustryAccountCategoryBodySchema, 'body'),
  createIndustryAccountCategory,
);
router.get(
  '/',
  validate(listIndustryAccountCategoriesQuerySchema, 'query'),
  listIndustryAccountCategories,
);
router.get(
  '/:id',
  validate(industryAccountCategoryIdParamsSchema, 'params'),
  getIndustryAccountCategory,
);
router.put(
  '/:id',
  validate(industryAccountCategoryIdParamsSchema, 'params'),
  validate(updateIndustryAccountCategoryBodySchema, 'body'),
  updateIndustryAccountCategory,
);
router.delete(
  '/:id',
  validate(industryAccountCategoryIdParamsSchema, 'params'),
  deleteIndustryAccountCategory,
);

export default router;
