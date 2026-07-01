import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import authorize from '../../../middlewares/authorize.js';
import { alertController } from './alert.controller';
import {
  alertIdParams,
  listAlertQuery,
  updateAlertStatusBody,
} from './alert.validate';

const router = Router();

router.get(
  '/',
  authorize('ALERTS', 'READ'),
  validate(listAlertQuery, 'query'),
  alertController.getAll,
);
router.get(
  '/:id',
  authorize('ALERTS', 'READ'),
  validate(alertIdParams, 'params'),
  alertController.getById,
);
router.put(
  '/:id/status',
  authorize('ALERTS', 'UPDATE'),
  validate(alertIdParams, 'params'),
  validate(updateAlertStatusBody, 'body'),
  alertController.updateStatus,
);

export default router;
