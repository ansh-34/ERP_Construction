import { Router } from 'express';
import authorize from '@/middlewares/authorize';
import { validate } from '@/middlewares/validate';
import { maintenanceLogController } from './maintenanceLog.controller';
import {
  createMaintenanceLogBody,
  idParams,
  listMaintenanceLogQuery,
} from './maintenanceLog.validate';

const router = Router();

router.post(
  '/',
  authorize('MAINTENANCE_LOG', 'CREATE'),
  validate(createMaintenanceLogBody, 'body'),
  maintenanceLogController.create,
);
router.get(
  '/',
  authorize('MAINTENANCE_LOG', 'READ'),
  validate(listMaintenanceLogQuery, 'query'),
  maintenanceLogController.getAll,
);
router.get(
  '/:id',
  authorize('MAINTENANCE_LOG', 'READ'),
  validate(idParams, 'params'),
  maintenanceLogController.getById,
);
router.delete(
  '/:id',
  authorize('MAINTENANCE_LOG', 'DELETE'),
  validate(idParams, 'params'),
  maintenanceLogController.delete,
);

export default router;
