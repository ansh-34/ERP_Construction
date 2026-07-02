import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { listIndustryAccountCategories } from './industryAccountCategory.controller.js';
import { listIndustryAccountCategoriesQuerySchema } from './industryAccountCategory.validator.js';

const router = Router();

router.get(
  '/',
  validate(listIndustryAccountCategoriesQuerySchema, 'query'),
  listIndustryAccountCategories,
);

export default router;
