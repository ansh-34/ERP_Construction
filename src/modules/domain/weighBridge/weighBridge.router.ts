import { Router } from 'express';
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
  validate(createWeighBridgeBodySchema, 'body'),
  createWeighBridge,
);

router.get(
  '/',
  validate(listWeighBridgesQuerySchema, 'query'),
  listWeighBridges,
);

router.get(
  '/:id',
  validate(weighBridgeIdParamsSchema, 'params'),
  getWeighBridgeById,
);

router.put(
  '/:id',
  validate(weighBridgeIdParamsSchema, 'params'),
  validate(updateWeighBridgeBodySchema, 'body'),
  updateWeighBridge,
);

router.delete(
  '/:id',
  validate(weighBridgeIdParamsSchema, 'params'),
  deleteWeighBridge,
);

export default router;
