import { z } from 'zod';
import { paginationQuerySchema } from '../../common/common.validator.js';

export const createWeighBridgeBodySchema = z.object({
  ticketNumber: z.string().min(1).optional(),
  date: z.string().datetime().optional(),
  driverName: z.string().min(1),
  vehicleNo: z.string().min(1),
  supplier: z.string().min(1),
  material: z.string().min(1),
  gateNoteNo: z.string().min(1),
  tareWeight: z.string().min(1),
  grossWeight: z.string().min(1),
  weighBridgeStatus: z.string().optional(),
  operatorId: z.string().uuid(),
  remarks: z.string().optional(),
  projectId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const updateWeighBridgeBodySchema =
  createWeighBridgeBodySchema.partial();

export const listWeighBridgesQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  weighBridgeStatus: z.string().optional(),
  projectId: z.string().uuid().optional(),
  searchKey: z.string().optional(),
});

export const weighBridgeIdParamsSchema = z.object({
  id: z
    .string()
    .uuid({ message: 'Invalid weigh bridge ID format. Must be a UUID' }),
});
