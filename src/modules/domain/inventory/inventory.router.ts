import { Router } from 'express';
// import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  getInventoryStats,
  listInventory,
  createInventoryEntry,
  updateReorderLevel,
  deleteInventoryEntry,
  getInventoryAnalytics,
} from './inventory.controller.js';
import {
  createInventoryBodySchema,
  updateReorderLevelBodySchema,
  inventoryListQuerySchema,
  inventoryIdParamsSchema,
} from './inventory.validator.js';

const router = Router();

// analytics
router.get('/analytics', getInventoryAnalytics);

// aggregate statistics
router.get('/stats', /* authorize('inventory', 'read'), */ getInventoryStats);

router.get(
  '/',
  // authorize('inventory', 'read'),
  validate(inventoryListQuerySchema, 'query'),
  listInventory,
);

//  create new entry
router.post(
  '/',
  // authorize('inventory', 'create'),
  validate(createInventoryBodySchema, 'body'),
  createInventoryEntry,
);

//  update reorder level
router.put(
  '/:id/reorder',
  // authorize('inventory', 'update'),
  validate(inventoryIdParamsSchema, 'params'),
  validate(updateReorderLevelBodySchema, 'body'),
  updateReorderLevel,
);

// delete entry
router.delete(
  '/:id',
  validate(inventoryIdParamsSchema, 'params'),
  deleteInventoryEntry,
);

export default router;
