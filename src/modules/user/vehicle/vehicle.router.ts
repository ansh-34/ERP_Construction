import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  getVehicleStats,
  getVehicleById,
  createVehicle,
  updateVehicle,
  listVehicles,
  deleteVehicle,
  getVehicleAnalytics,
} from './vehicle.controller.js';
import {
  createVehicleBodySchema,
  updateVehicleBodySchema,
  listVehiclesQuerySchema,
} from './vehicle.validator.js';
import { idParamSchema } from '../../common/common.validator.js';

const router = Router();

// analytics
router.get('/analytics', authorize('VEHICLE', 'READ'), getVehicleAnalytics);

// stats
router.get('/stats', authorize('VEHICLE', 'READ'), getVehicleStats);

// list
router.get(
  '/',
  authorize('VEHICLE', 'READ'),
  validate(listVehiclesQuerySchema, 'query'),
  listVehicles,
);

// detail by id
router.get(
  '/:id',
  authorize('VEHICLE', 'READ'),
  validate(idParamSchema, 'params'),
  getVehicleById,
);

// create
router.post(
  '/',
  authorize('VEHICLE', 'CREATE'),
  validate(createVehicleBodySchema, 'body'),
  createVehicle,
);

// update
router.put(
  '/',
  authorize('VEHICLE', 'UPDATE'),
  validate(updateVehicleBodySchema, 'body'),
  updateVehicle,
);

// delete
router.delete(
  '/:id',
  authorize('VEHICLE', 'DELETE'),
  validate(idParamSchema, 'params'),
  deleteVehicle,
);

export default router;
