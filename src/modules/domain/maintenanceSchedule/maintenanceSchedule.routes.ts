import { Router } from 'express';
import { validate } from '@/middlewares/validate';
import { maintenanceScheduleController } from './maintenanceSchedule.controller';
import {
  advanceMaintenanceScheduleBody,
  createMaintenanceScheduleBody,
  domainIdQuery,
  idParams,
  listMaintenanceScheduleQuery,
  updateMaintenanceScheduleBody,
} from './maintenanceSchedule.validate';

const maintenanceScheduleRouter = Router();

maintenanceScheduleRouter.post(
  '/',
  validate(createMaintenanceScheduleBody, 'body'),
  maintenanceScheduleController.create,
);
maintenanceScheduleRouter.get(
  '/',
  validate(listMaintenanceScheduleQuery, 'query'),
  maintenanceScheduleController.getAll,
);
maintenanceScheduleRouter.get(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  maintenanceScheduleController.getById,
);
maintenanceScheduleRouter.put(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  validate(updateMaintenanceScheduleBody, 'body'),
  maintenanceScheduleController.update,
);
maintenanceScheduleRouter.put(
  '/:id/advance',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  validate(advanceMaintenanceScheduleBody, 'body'),
  maintenanceScheduleController.advance,
);
maintenanceScheduleRouter.delete(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  maintenanceScheduleController.delete,
);

export default maintenanceScheduleRouter;
