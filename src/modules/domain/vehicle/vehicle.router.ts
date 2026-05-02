import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import { createVehicle, listVehicles } from './vehicle.controller.js';
import {
  createVehicleBodySchema,
  listVehiclesQuerySchema,
} from './vehicle.validator.js';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  authorize('vehicle', 'create'),
  validate(createVehicleBodySchema, 'body'),
  createVehicle,
);
router.get(
  '/',
  authorize('vehicle', 'read'),
  validate(listVehiclesQuerySchema, 'query'),
  listVehicles,
);

export default router;
