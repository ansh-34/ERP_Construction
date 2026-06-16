import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createFuelLog,
  listFuelLogs,
  getFuelLogById,
  updateFuelLog,
  deleteFuelLog,
} from './fuelLog.controller.js';
import {
  createFuelLogBody,
  updateFuelLogBody,
  listFuelLogQuery,
  fuelLogIdParamsSchema,
} from './fuelLog.validate.js';

const router = Router();

router.post(
  '/',
  authorize('FUEL_LOG', 'CREATE'),
  validate(createFuelLogBody, 'body'),
  createFuelLog,
);

router.get(
  '/',
  authorize('FUEL_LOG', 'READ'),
  validate(listFuelLogQuery, 'query'),
  listFuelLogs,
);

router.get(
  '/:id',
  authorize('FUEL_LOG', 'READ'),
  validate(fuelLogIdParamsSchema, 'params'),
  getFuelLogById,
);

router.put(
  '/:id',
  authorize('FUEL_LOG', 'UPDATE'),
  validate(fuelLogIdParamsSchema, 'params'),
  validate(updateFuelLogBody, 'body'),
  updateFuelLog,
);

router.delete(
  '/:id',
  authorize('FUEL_LOG', 'DELETE'),
  validate(fuelLogIdParamsSchema, 'params'),
  deleteFuelLog,
);

export default router;
