import { z } from 'zod';
import {
  idParamSchema,
  paginationDateQuerySchema,
} from '../../common/common.validator.js';

export const listGeneralLedgerQuerySchema = paginationDateQuerySchema.extend({
  accountId: z.string().uuid('Invalid account ID').optional(),
  fiscalYearId: z.string().uuid('Invalid fiscal year ID').optional(),
  accountingPeriodId: z
    .string()
    .uuid('Invalid accounting period ID')
    .optional(),
  costCenterId: z.string().uuid('Invalid cost center ID').optional(),
  projectId: z.string().uuid('Invalid project ID').optional(),
});

export const generalLedgerIdParamSchema = idParamSchema;
