import { Router } from 'express';
// import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import { upload } from '../../../middlewares/upload.js';
import {
  getInventoryStats,
  listInventory,
  createInventoryEntry,
  updateReorderLevel,
  deleteInventoryEntry,
  getInventoryAnalytics,
  importInventory,
  exportInventory,
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

// export to xlsx (codes + names localized to ?lang=)
router.get('/export', exportInventory);

// import from xlsx (same format as export)
router.post('/import', upload.single('file'), importInventory);

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
