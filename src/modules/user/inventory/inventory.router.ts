import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  getInventoryStats,
  listInventory,
  createInventoryEntry,
  updateReorderLevel,
  deleteInventoryEntry,
} from './inventory.controller.js';
import {
  createInventoryBodySchema,
  updateReorderLevelBodySchema,
  inventoryListQuerySchema,
  inventoryIdParamsSchema,
} from './inventory.validator.js';

const router = Router();

// aggregate statistics
router.get('/stats', authorize('INVENTORY', 'READ'), getInventoryStats);

router.get(
  '/',
  authorize('INVENTORY', 'READ'),
  validate(inventoryListQuerySchema, 'query'),
  listInventory,
);

//  create new entry
router.post(
  '/',
  authorize('INVENTORY', 'CREATE'),
  validate(createInventoryBodySchema, 'body'),
  createInventoryEntry,
);

//  update reorder level
router.put(
  '/:id/reorder',
  authorize('INVENTORY', 'UPDATE'),
  validate(inventoryIdParamsSchema, 'params'),
  validate(updateReorderLevelBodySchema, 'body'),
  updateReorderLevel,
);

// delete entry
router.delete(
  '/:id',
  authorize('INVENTORY', 'DELETE'),
  validate(inventoryIdParamsSchema, 'params'),
  deleteInventoryEntry,
);

export default router;
