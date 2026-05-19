import { Router } from 'express';
// import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  getVehicleStats,
  getVehicleById,
  createVehicle,
  listVehicles,
} from './vehicle.controller.js';
import {
  createVehicleBodySchema,
  listVehiclesQuerySchema,
} from './vehicle.validator.js';
import { idParamSchema } from '../../common/common.validator.js';

const router = Router();

// stats
router.get('/stats', /* authorize('vehicle', 'read'), */ getVehicleStats);

// list
router.get(
  '/',
  // authorize('vehicle', 'read'),
  validate(listVehiclesQuerySchema, 'query'),
  listVehicles,
);

// detail by id
router.get(
  '/:id',
  // authorize('vehicle', 'read'),
  validate(idParamSchema, 'params'),
  getVehicleById,
);

// create
router.post(
  '/',
  // authorize('vehicle', 'create'),
  validate(createVehicleBodySchema, 'body'),
  createVehicle,
);

export default router;
