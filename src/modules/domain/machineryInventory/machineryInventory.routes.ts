import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { machineryInventoryController } from './machineryInventory.controller';
import {
  listMachineryInventoryQuery,
  machineryInventoryIdParams,
} from './machineryInventory.validate';

const router = Router();

router.get(
  '/',
  validate(listMachineryInventoryQuery, 'query'),
  machineryInventoryController.getAll,
);

router.get(
  '/:id',
  validate(machineryInventoryIdParams, 'params'),
  machineryInventoryController.getById,
);

export default router;
