import { Router } from 'express';
import authorize from '@/middlewares/authorize';
import { validate } from '@/middlewares/validate';
import { maintenanceScheduleController } from './maintenanceSchedule.controller';
import {
  advanceMaintenanceScheduleBody,
  createMaintenanceScheduleBody,
  idParams,
  listMaintenanceScheduleQuery,
  updateMaintenanceScheduleBody,
} from './maintenanceSchedule.validate';

const router = Router();

router.post(
  '/',
  authorize('MAINTENANCE_SCHEDULE', 'CREATE'),
  validate(createMaintenanceScheduleBody, 'body'),
  maintenanceScheduleController.create,
);
router.get(
  '/',
  authorize('MAINTENANCE_SCHEDULE', 'READ'),
  validate(listMaintenanceScheduleQuery, 'query'),
  maintenanceScheduleController.getAll,
);
router.get(
  '/:id',
  authorize('MAINTENANCE_SCHEDULE', 'READ'),
  validate(idParams, 'params'),
  maintenanceScheduleController.getById,
);
router.put(
  '/:id',
  authorize('MAINTENANCE_SCHEDULE', 'UPDATE'),
  validate(idParams, 'params'),
  validate(updateMaintenanceScheduleBody, 'body'),
  maintenanceScheduleController.update,
);
router.put(
  '/:id/advance',
  authorize('MAINTENANCE_SCHEDULE', 'UPDATE'),
  validate(idParams, 'params'),
  validate(advanceMaintenanceScheduleBody, 'body'),
  maintenanceScheduleController.advance,
);
router.delete(
  '/:id',
  authorize('MAINTENANCE_SCHEDULE', 'DELETE'),
  validate(idParams, 'params'),
  maintenanceScheduleController.delete,
);

export default router;
