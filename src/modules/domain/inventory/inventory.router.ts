import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import { getInventory, addItemToInventory } from './inventory.controller.js';
import {
  addInventoryItemBodySchema,
  inventoryListQuerySchema,
} from './inventory.validator.js';

const router = Router();

router.use(authMiddleware);
router.get(
  '/records/list',
  authorize('inventory', 'read'),
  validate(inventoryListQuerySchema, 'query'),
  getInventory,
);
router.post(
  '/records/entry',
  authorize('inventory', 'write'),
  validate(addInventoryItemBodySchema, 'body'),
  addItemToInventory,
);

export default router;
