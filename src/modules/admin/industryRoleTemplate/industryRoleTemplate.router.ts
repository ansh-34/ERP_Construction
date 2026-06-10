import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import { validate } from '../../../middlewares/validate.js';
import {
  bulkCreateIndustryRoleTemplates,
  createIndustryRoleTemplate,
  deleteIndustryRoleTemplate,
  getIndustryRoleTemplate,
  listIndustryRoleTemplates,
  updateIndustryRoleTemplate,
} from './industryRoleTemplate.controller.js';
import {
  bulkCreateIndustryRoleTemplateBodySchema,
  createIndustryRoleTemplateBodySchema,
  industryRoleTemplateIdParamsSchema,
  listIndustryRoleTemplatesQuerySchema,
  updateIndustryRoleTemplateBodySchema,
} from './industryRoleTemplate.validator.js';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  validate(createIndustryRoleTemplateBodySchema, 'body'),
  createIndustryRoleTemplate,
);
router.post(
  '/bulk',
  validate(bulkCreateIndustryRoleTemplateBodySchema, 'body'),
  bulkCreateIndustryRoleTemplates,
);
router.get(
  '/',
  validate(listIndustryRoleTemplatesQuerySchema, 'query'),
  listIndustryRoleTemplates,
);
router.get(
  '/:id',
  validate(industryRoleTemplateIdParamsSchema, 'params'),
  getIndustryRoleTemplate,
);
router.put(
  '/:id',
  validate(industryRoleTemplateIdParamsSchema, 'params'),
  validate(updateIndustryRoleTemplateBodySchema, 'body'),
  updateIndustryRoleTemplate,
);
router.delete(
  '/:id',
  validate(industryRoleTemplateIdParamsSchema, 'params'),
  deleteIndustryRoleTemplate,
);

export default router;
