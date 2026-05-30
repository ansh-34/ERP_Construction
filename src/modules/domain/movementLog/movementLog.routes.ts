import { Router } from 'express';
import { validate } from '@/middlewares/validate';
import { movementLogController } from './movementLog.controller';
import {
  createMovementLogBody,
  domainIdQuery,
  idParams,
  listMovementLogQuery,
} from './movementLog.validate';

const movementLogRouter = Router();

movementLogRouter.post(
  '/',
  validate(createMovementLogBody, 'body'),
  movementLogController.create,
);
movementLogRouter.get(
  '/',
  validate(listMovementLogQuery, 'query'),
  movementLogController.getAll,
);
movementLogRouter.get(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  movementLogController.getById,
);
movementLogRouter.delete(
  '/:id',
  validate(idParams, 'params'),
  validate(domainIdQuery, 'query'),
  movementLogController.delete,
);

export default movementLogRouter;
