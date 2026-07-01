import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import authorize from '../../../middlewares/authorize.js';
import { notificationController } from './notification.controller';
import {
  listNotificationQuery,
  notificationIdParams,
} from './notification.validate';

const router = Router();

router.get(
  '/',
  authorize('NOTIFICATIONS', 'READ'),
  validate(listNotificationQuery, 'query'),
  notificationController.getAll,
);
router.put(
  '/read-all',
  authorize('NOTIFICATIONS', 'UPDATE'),
  notificationController.markAllRead,
);
router.get(
  '/:id',
  authorize('NOTIFICATIONS', 'READ'),
  validate(notificationIdParams, 'params'),
  notificationController.getById,
);
router.put(
  '/:id/read',
  authorize('NOTIFICATIONS', 'UPDATE'),
  validate(notificationIdParams, 'params'),
  notificationController.markRead,
);

export default router;
