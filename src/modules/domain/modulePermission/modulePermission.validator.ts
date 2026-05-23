import { z } from 'zod';
import { paginationQuerySchema } from '../../common/common.validator.js';

export const listModulePermissionsQuerySchema = z.object({
  ...paginationQuerySchema.shape,
  searchKey: z.string().optional(),
  moduleId: z.string().optional(),
  permissionId: z.string().optional(),
});
