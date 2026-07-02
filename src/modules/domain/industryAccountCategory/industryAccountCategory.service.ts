import { IndustryAccountCategoryService } from '../../superAdmin/industryAccountCategory/industryAccountCategory.service.js';

/**
 * Domain-facing read-only access to global IndustryAccountCategory templates.
 */
export const DomainIndustryAccountCategoryService = {
  list: IndustryAccountCategoryService.list,
};
