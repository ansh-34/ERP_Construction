import { IndustryAccountService } from '../../superAdmin/industryAccount/industryAccount.service.js';

/**
 * Domain-facing read-only access to global IndustryAccount templates.
 * SuperAdmin remains the owner of all mutations.
 */
export const DomainIndustryAccountService = {
  list: IndustryAccountService.list,
};
