import { z } from 'zod';
import { paginationQuerySchema } from '../../common/common.validator.js';

const saleOrderProductSchema = z.object({
  productId: z.string().uuid(),
  productGradeId: z.string().uuid().optional(),
  quantity: z.number().positive(),
  uomId: z.string().uuid(),
  unitRate: z.number().min(0),
  taxAmount: z.number().min(0).optional().default(0),
  transportationCharge: z.number().min(0).optional().default(0),
  royaltyAmount: z.number().min(0).optional().default(0),
});

export const createSaleOrderBodySchema = z.object({
  ticketNumber: z.string().min(1).optional(),
  date: z.string().datetime().optional(),
  entryType: z.enum(['PLANT_ENTRY', 'MANUAL']).optional(),
  customerId: z.string().uuid(),
  paymentType: z.enum(['CASH', 'CREDIT']).optional(),
  orderStatus: z.enum(['PENDING', 'INPROGRESS', 'INVOICED']).optional(),
  remarks: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  products: z
    .array(saleOrderProductSchema)
    .min(1, 'At least one product is required'),
});

export const updateSaleOrderBodySchema = z.object({
  ticketNumber: z.string().min(1).optional(),
  date: z.string().datetime().optional(),
  entryType: z.enum(['PLANT_ENTRY', 'MANUAL']).optional(),
  customerId: z.string().uuid().optional(),
  paymentType: z.enum(['CASH', 'CREDIT']).optional(),
  orderStatus: z.enum(['PENDING', 'INPROGRESS', 'INVOICED']).optional(),
  remarks: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  products: z.array(saleOrderProductSchema).min(1).optional(),
});

export const listSaleOrdersQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  orderStatus: z.enum(['PENDING', 'INPROGRESS', 'INVOICED']).optional(),
  paymentType: z.enum(['CASH', 'CREDIT']).optional(),
  customerId: z.string().uuid().optional(),
  searchKey: z.string().optional(),
});

export const saleOrderIdParamsSchema = z.object({
  id: z
    .string()
    .uuid({ message: 'Invalid sale order ID format. Must be a UUID' }),
});

export const saleOrderProductParamsSchema = z.object({
  id: z
    .string()
    .uuid({ message: 'Invalid sale order ID format. Must be a UUID' }),
  productId: z
    .string()
    .uuid({ message: 'Invalid product line ID format. Must be a UUID' }),
});
