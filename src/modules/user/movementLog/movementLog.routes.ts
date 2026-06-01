import { Router } from 'express';
import authorize from '@/middlewares/authorize';
import { validate } from '@/middlewares/validate';
import { movementLogController } from './movementLog.controller';
import {
  createMovementLogBody,
  idParams,
  listMovementLogQuery,
} from './movementLog.validate';

const router = Router();

router.post(
  '/',
  authorize('MOVEMENT_LOG', 'CREATE'),
  validate(createMovementLogBody, 'body'),
  movementLogController.create,
);
router.get(
  '/',
  authorize('MOVEMENT_LOG', 'READ'),
  validate(listMovementLogQuery, 'query'),
  movementLogController.getAll,
);
router.get(
  '/:id',
  authorize('MOVEMENT_LOG', 'READ'),
  validate(idParams, 'params'),
  movementLogController.getById,
);
router.delete(
  '/:id',
  authorize('MOVEMENT_LOG', 'DELETE'),
  validate(idParams, 'params'),
  movementLogController.delete,
);

export default router;
