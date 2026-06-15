import { Router } from 'express';
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

router.post('/', validate(createFuelLogBody, 'body'), createFuelLog);

router.get('/', validate(listFuelLogQuery, 'query'), listFuelLogs);

router.get('/:id', validate(fuelLogIdParamsSchema, 'params'), getFuelLogById);

router.put(
  '/:id',
  validate(fuelLogIdParamsSchema, 'params'),
  validate(updateFuelLogBody, 'body'),
  updateFuelLog,
);

router.delete('/:id', validate(fuelLogIdParamsSchema, 'params'), deleteFuelLog);

export default router;
