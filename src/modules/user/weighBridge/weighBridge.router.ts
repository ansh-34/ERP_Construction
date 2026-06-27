import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createWeighBridge,
  listWeighBridges,
  getWeighBridgeById,
  updateWeighBridge,
  deleteWeighBridge,
} from './weighBridge.controller.js';
import {
  createWeighBridgeBodySchema,
  updateWeighBridgeBodySchema,
  listWeighBridgesQuerySchema,
  weighBridgeIdParamsSchema,
} from './weighBridge.validator.js';

const router = Router();

router.post(
  '/',
  authorize('WEIGH_BRIDGE', 'CREATE'),
  validate(createWeighBridgeBodySchema, 'body'),
  createWeighBridge,
);

router.get(
  '/',
  authorize('WEIGH_BRIDGE', 'READ'),
  validate(listWeighBridgesQuerySchema, 'query'),
  listWeighBridges,
);

router.get(
  '/:id',
  authorize('WEIGH_BRIDGE', 'READ'),
  validate(weighBridgeIdParamsSchema, 'params'),
  getWeighBridgeById,
);

router.put(
  '/:id',
  authorize('WEIGH_BRIDGE', 'UPDATE'),
  validate(weighBridgeIdParamsSchema, 'params'),
  validate(updateWeighBridgeBodySchema, 'body'),
  updateWeighBridge,
);

router.delete(
  '/:id',
  authorize('WEIGH_BRIDGE', 'DELETE'),
  validate(weighBridgeIdParamsSchema, 'params'),
  deleteWeighBridge,
);

export default router;
