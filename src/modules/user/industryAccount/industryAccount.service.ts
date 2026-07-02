import { IndustryAccountService } from '../../superAdmin/industryAccount/industryAccount.service.js';

/**
 * User-facing read-only access to global IndustryAccount templates.
 * SuperAdmin remains the owner of all mutations.
 */
export const UserIndustryAccountService = {
  list: IndustryAccountService.list,
};
