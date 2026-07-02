import { z } from 'zod';
import {
  idParamSchema,
  paginationQuerySchema,
} from '../../common/common.validator.js';

const recipientType = z.enum(['DOMAIN', 'ADMIN', 'USER']);

export const listNotificationQuery = paginationQuerySchema.extend({
  recipientType: recipientType.optional(),
  recipientId: z.string().trim().uuid().optional(),
  isRead: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

export const notificationIdParams = idParamSchema;
