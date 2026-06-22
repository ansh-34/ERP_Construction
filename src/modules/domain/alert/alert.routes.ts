import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { alertController } from './alert.controller';
import {
  alertIdParams,
  listAlertQuery,
  updateAlertStatusBody,
} from './alert.validate';

const router = Router();

router.get('/', validate(listAlertQuery, 'query'), alertController.getAll);
router.get('/:id', validate(alertIdParams, 'params'), alertController.getById);
router.put(
  '/:id/status',
  validate(alertIdParams, 'params'),
  validate(updateAlertStatusBody, 'body'),
  alertController.updateStatus,
);

export default router;
