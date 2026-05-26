import { z } from 'zod';

export const reportQuerySchema = z.object({
  reportType: z.enum(['summary']),
  country: z.string().trim().optional(),
});

export const reportExportQuerySchema = reportQuerySchema.extend({
  export: z.enum(['csv']),
});

export type ReportQuery = z.infer<typeof reportQuerySchema>;
export type ReportExportQuery = z.infer<typeof reportExportQuerySchema>;
