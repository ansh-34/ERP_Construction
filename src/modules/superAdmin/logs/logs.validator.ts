import { z } from 'zod';

export const analyticsQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month'], {
    required_error: 'period is required',
    invalid_type_error: 'period must be day, week, or month',
  }),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD')
    .optional(),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
