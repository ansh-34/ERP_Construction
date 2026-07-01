import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

const localizedName = z
  .record(z.string(), z.string().trim().min(1))
  .refine(
    (value) => typeof value.en === 'string' && value.en.trim().length > 0,
    {
      message: 'name.en is required',
    },
  );

const optionalText = z.string().trim().min(1).optional();
const uuidArray = z.array(z.string().uuid()).optional();

export const createCostCenterBodySchema = z.object({
  name: localizedName,
  description: optionalText,
  parentId: z.string().uuid('Invalid parent ID').optional(),
  costCenterId: z.string().uuid('Invalid cost center ID').optional(),
  projectId: z.string().uuid('Invalid project ID').optional(),
  industryIds: uuidArray,
  industryCategoryIds: uuidArray,
  isSystem: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateCostCenterBodySchema = z.object({
  name: localizedName.optional(),
  description: optionalText,
  costCenterId: z.string().uuid('Invalid cost center ID').optional(),
  projectId: z.string().uuid('Invalid project ID').optional(),
  industryIds: uuidArray,
  industryCategoryIds: uuidArray,
  isSystem: z.boolean().optional(),
  status: statusFilterSchema.shape.status.optional(),
});

export const listCostCentersQuerySchema = paginationQuerySchema
  .merge(statusFilterSchema)
  .extend({
    searchKey: z.string().optional(),
    parentId: z.string().uuid('Invalid parent ID').optional(),
  });

export const costCenterIdParamSchema = idParamSchema;
