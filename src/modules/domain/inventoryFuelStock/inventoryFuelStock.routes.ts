import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { inventoryFuelStockController } from './inventoryFuelStock.controller';
import {
  inventoryFuelStockIdParams,
  listInventoryFuelStockQuery,
} from './inventoryFuelStock.validate';

const router = Router();

router.get(
  '/',
  validate(listInventoryFuelStockQuery, 'query'),
  inventoryFuelStockController.getAll,
);

router.get(
  '/:id',
  validate(inventoryFuelStockIdParams, 'params'),
  inventoryFuelStockController.getById,
);

export default router;
