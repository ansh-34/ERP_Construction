import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createRawMaterialPurchaseRequest,
  listRawMaterialPurchaseRequests,
  getRawMaterialPurchaseRequestById,
  updateRawMaterialPurchaseRequest,
  deleteRawMaterialPurchaseRequest,
  approveOrRejectRawMaterialPurchaseRequest,
} from './rawMaterialPurchaseRequest.controller.js';
import {
  createRawMaterialPurchaseRequestBodySchema,
  updateRawMaterialPurchaseRequestBodySchema,
  listRawMaterialPurchaseRequestsQuerySchema,
  rawMaterialPurchaseRequestIdParamsSchema,
  approveRejectBodySchema,
} from './rawMaterialPurchaseRequest.validator.js';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  // authorize('rawMaterialPurchaseRequest', 'create'),
  validate(createRawMaterialPurchaseRequestBodySchema, 'body'),
  createRawMaterialPurchaseRequest,
);

router.get(
  '/',
  // authorize('rawMaterialPurchaseRequest', 'read'),
  validate(listRawMaterialPurchaseRequestsQuerySchema, 'query'),
  listRawMaterialPurchaseRequests,
);

router.get(
  '/:id',
  // authorize('rawMaterialPurchaseRequest', 'read'),
  validate(rawMaterialPurchaseRequestIdParamsSchema, 'params'),
  getRawMaterialPurchaseRequestById,
);

router.put(
  '/:id',
  // authorize('rawMaterialPurchaseRequest', 'update'),
  validate(rawMaterialPurchaseRequestIdParamsSchema, 'params'),
  validate(updateRawMaterialPurchaseRequestBodySchema, 'body'),
  updateRawMaterialPurchaseRequest,
);

router.delete(
  '/:id',
  // authorize('rawMaterialPurchaseRequest', 'delete'),
  validate(rawMaterialPurchaseRequestIdParamsSchema, 'params'),
  deleteRawMaterialPurchaseRequest,
);

router.put(
  '/:id/approval',
  // authorize('rawMaterialPurchaseRequest', 'approve'),
  validate(rawMaterialPurchaseRequestIdParamsSchema, 'params'),
  validate(approveRejectBodySchema, 'body'),
  approveOrRejectRawMaterialPurchaseRequest,
);

export default router;