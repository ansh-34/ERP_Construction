import { Router } from 'express';
// import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  getInventoryStats,
  listInventory,
  createInventoryEntry,
  updateReorderLevel,
} from './inventory.controller.js';
import {
  createInventoryBodySchema,
  updateReorderLevelBodySchema,
  inventoryListQuerySchema,
  inventoryIdParamsSchema,
} from './inventory.validator.js';

const router = Router();

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

export default router;
