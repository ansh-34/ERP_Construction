import { IndustryAccountCategoryService } from '../../superAdmin/industryAccountCategory/industryAccountCategory.service.js';

/**
 * User-facing read-only access to global IndustryAccountCategory templates.
 */
export const UserIndustryAccountCategoryService = {
  list: IndustryAccountCategoryService.list,
};
