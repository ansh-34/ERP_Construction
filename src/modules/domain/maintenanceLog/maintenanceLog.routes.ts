import { Router } from 'express';
import { validate } from '@/middlewares/validate';
import { maintenanceLogController } from './maintenanceLog.controller';
import {
  createMaintenanceLogBody,
  domainIdQuery,
  idParams,
  listMaintenanceLogQuery,
} from './maintenanceLog.validate';

const maintenanceLogRouter = Router();

maintenanceLogRouter.post(
  '/',
  validate(createMaintenanceLogBody, 'body'),
  maintenanceLogController.create,
);
maintenanceLogRouter.get(
  '/',
  validate(listMaintenanceLogQuery, 'query'),
  maintenanceLogController.getAll,
);
maintenanceLogRouter.get(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  maintenanceLogController.getById,
);
maintenanceLogRouter.delete(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  maintenanceLogController.delete,
);

export default maintenanceLogRouter;
