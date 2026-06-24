import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import { inventoryFuelStockController } from './inventoryFuelStock.controller';
import {
  inventoryFuelStockIdParams,
  listInventoryFuelStockQuery,
} from './inventoryFuelStock.validate';

const router = Router();

router.get(
  '/',
  authorize('FUEL_LOG', 'READ'),
  validate(listInventoryFuelStockQuery, 'query'),
  inventoryFuelStockController.getAll,
);

router.get(
  '/:id',
  authorize('FUEL_LOG', 'READ'),
  validate(inventoryFuelStockIdParams, 'params'),
  inventoryFuelStockController.getById,
);

export default router;
