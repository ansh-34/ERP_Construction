import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { machineryInventoryLogController } from './machineryInventoryLog.controller';
import {
  createMachineryInventoryLogBody,
  listMachineryInventoryLogQuery,
  machineryInventoryLogIdParams,
  updateMachineryInventoryLogBody,
} from './machineryInventoryLog.validate';

const router = Router();

router.post(
  '/',
  validate(createMachineryInventoryLogBody, 'body'),
  machineryInventoryLogController.create,
);

router.get(
  '/',
  validate(listMachineryInventoryLogQuery, 'query'),
  machineryInventoryLogController.getAll,
);

router.get(
  '/:id',
  validate(machineryInventoryLogIdParams, 'params'),
  machineryInventoryLogController.getById,
);

router.put(
  '/:id',
  validate(machineryInventoryLogIdParams, 'params'),
  validate(updateMachineryInventoryLogBody, 'body'),
  machineryInventoryLogController.update,
);

router.delete(
  '/:id',
  validate(machineryInventoryLogIdParams, 'params'),
  machineryInventoryLogController.softDelete,
);

export default router;
