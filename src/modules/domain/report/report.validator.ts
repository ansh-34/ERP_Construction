import { z } from 'zod';

export const projectSummaryQuerySchema = z.object({
  country: z.string().trim().optional(),
});

export const projectSummaryExportQuerySchema = projectSummaryQuerySchema.extend(
  {
    export: z.enum(['xlsx']),
    projectId: z.string().trim().uuid().optional(),
  },
);

export const projectUserTaskQuerySchema = z.object({
  projectId: z.string().trim().uuid().optional(),
  userId: z.string().trim().uuid().optional(),
});

export const projectUserTaskExportQuerySchema =
  projectUserTaskQuerySchema.extend({
    export: z.enum(['xlsx']),
  });

export const machineSummaryQuerySchema = z.object({
  projectId: z.string().trim().uuid().optional(),
  machineryId: z.string().trim().uuid().optional(),
});

export const machineSummaryExportQuerySchema = machineSummaryQuerySchema.extend(
  {
    export: z.enum(['xlsx']),
    vehicleId: z.string().trim().uuid().optional(),
  },
);
