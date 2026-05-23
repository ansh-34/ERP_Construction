import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
  statusFilterSchema,
} from '../../common/common.validator.js';

const localizedName = z
  .record(
    z.string().regex(/^[a-z]{2}$/, 'Invalid language code'),
    z.string().min(1, 'Translation cannot be empty'),
  )
  .refine((data) => !!data.en, {
    message: 'English (en) translation is required',
    path: ['en'],
  });

const gradeItemSchema = z.object({
  id: z.string().uuid().optional(),
  gradeDisplayName: localizedName,
  gradeCode: z.string().min(1).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  standardRates: z.array(z.object({
    id: z.string().uuid().optional(),
    stdRateType: localizedName,
    stdRateValue: z.number().min(0, 'stdRateValue must be >= 0'),
    alertThresold: z.number().min(0, 'alertThresold must be >= 0'),
    status: z.enum(['active', 'inactive']).default('active'),
  })).optional(),
});

const standardRateItemSchema = z.object({
  id: z.string().uuid().optional(),
  gradeId: z.string().uuid().optional(),
  gradeCode: z.string().min(1).optional(),
  stdRateType: localizedName,
  stdRateValue: z.number().min(0, 'stdRateValue must be >= 0'),
  alertThresold: z.number().min(0, 'alertThresold must be >= 0'),
  status: z.enum(['active', 'inactive']).default('active'),
});

const uomItemSchema = z.object({
  id: z.string().uuid(),
});

// Product body schemas

export const createProductBodySchema = z.object({
  displayName: localizedName,
  productType: z.enum(['RAW_MATERIAL', 'FINISHED_PRODUCT']),
  status: z.enum(['active', 'inactive']).default('active'),
  uoms: z.array(uomItemSchema).optional(),
  grades: z.array(gradeItemSchema).optional(),
  standardRates: z.array(standardRateItemSchema).optional(),
});

export const updateProductBodySchema = z.object({
  displayName: localizedName.optional(),
  code: z.string().min(1).optional(),
  productType: z.enum(['RAW_MATERIAL', 'FINISHED_PRODUCT']).optional(),
  status: statusFilterSchema.shape.status.optional(),
  uoms: z.array(uomItemSchema).optional(),
  grades: z.array(gradeItemSchema).optional(),
  standardRates: z.array(standardRateItemSchema).optional(),
});

export const bulkUpdateGradesBodySchema = z.object({
  grades: z.array(gradeItemSchema).min(1),
});

export const bulkUpdateStdRatesBodySchema = z.object({
  standardRates: z.array(standardRateItemSchema).min(1),
});

export const listProductsQuerySchema = paginationQuerySchema
  .merge(statusFilterSchema)
  .extend({
    searchKey: z.string().optional(),
  });

export const productIdParamsSchema = idParamSchema;
