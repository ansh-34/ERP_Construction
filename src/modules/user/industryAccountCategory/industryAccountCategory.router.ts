import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import { listIndustryAccountCategories } from './industryAccountCategory.controller.js';
import { listIndustryAccountCategoriesQuerySchema } from './industryAccountCategory.validator.js';

const router = Router();

router.get(
  '/',
  authorize('INDUSTRY_ACCOUNT_CATEGORY', 'READ'),
  validate(listIndustryAccountCategoriesQuerySchema, 'query'),
  listIndustryAccountCategories,
);

export default router;
