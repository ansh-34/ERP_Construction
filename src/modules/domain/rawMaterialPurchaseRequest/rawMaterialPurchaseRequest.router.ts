import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createRawMaterialPurchaseRequest,
  listRawMaterialPurchaseRequests,
  listApprovedRawMaterialPurchaseRequests,
  listApprovedRawMaterialPurchaseRequestsByProduct,
  getRawMaterialPurchaseRequestById,
  updateRawMaterialPurchaseRequest,
  deleteRawMaterialPurchaseRequest,
  approveOrRejectRawMaterialPurchaseRequests,
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
  '/approved',
  validate(listRawMaterialPurchaseRequestsQuerySchema, 'query'),
  listApprovedRawMaterialPurchaseRequests,
);

router.get(
  '/approved/product/:productId',
  validate(listRawMaterialPurchaseRequestsQuerySchema, 'query'),
  listApprovedRawMaterialPurchaseRequestsByProduct,
);

// Single endpoint for both single and bulk approve/reject
router.put(
  '/approval',
  // authorize('rawMaterialPurchaseRequest', 'approve'),
  validate(approveRejectBodySchema, 'body'),
  approveOrRejectRawMaterialPurchaseRequests,
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

export default router;
