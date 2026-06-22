import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { notificationController } from './notification.controller';
import {
  listNotificationQuery,
  notificationIdParams,
} from './notification.validate';

const router = Router();

router.get(
  '/',
  validate(listNotificationQuery, 'query'),
  notificationController.getAll,
);
router.put('/read-all', notificationController.markAllRead);
router.get(
  '/:id',
  validate(notificationIdParams, 'params'),
  notificationController.getById,
);
router.put(
  '/:id/read',
  validate(notificationIdParams, 'params'),
  notificationController.markRead,
);

export default router;
