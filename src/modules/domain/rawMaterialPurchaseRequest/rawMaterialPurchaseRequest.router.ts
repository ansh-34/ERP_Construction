import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import {
  createRawMaterialPurchaseRequest,
  listRawMaterialPurchaseRequests,
  getRawMaterialPurchaseRequestById,
  updateRawMaterialPurchaseRequest,
  deleteRawMaterialPurchaseRequest,
  approveOrRejectRawMaterialPurchaseRequests,
  listPurchaseOrders,
  getPurchaseOrderById,
  // updatePurchaseOrder,
  listPoProducts,
  // updatePoProduct,
  // deletePoProduct,
} from './rawMaterialPurchaseRequest.controller.js';
import {
  createRawMaterialPurchaseRequestBodySchema,
  updateRawMaterialPurchaseRequestBodySchema,
  listRawMaterialPurchaseRequestsQuerySchema,
  rawMaterialPurchaseRequestIdParamsSchema,
  approveRejectBodySchema,
  listPurchaseOrdersQuerySchema,
  poIdParamsSchema,
  poProductIdParamsSchema,
  // updatePurchaseOrderBodySchema,
  // createPoProductBodySchema,
  // updatePoProductBodySchema,
} from './rawMaterialPurchaseRequest.validator.js';

const router = Router();

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

// --- Purchase Order Routes ---

router.get(
  '/purchase-orders',
  validate(listPurchaseOrdersQuerySchema, 'query'),
  listPurchaseOrders,
);

router.get(
  '/purchase-orders/:poId',
  validate(poIdParamsSchema, 'params'),
  getPurchaseOrderById,
);

// router.put(
//   '/purchase-orders/:poId',
//   validate(poIdParamsSchema, 'params'),
//   validate(updatePurchaseOrderBodySchema, 'body'),
//   updatePurchaseOrder,
// );

// --- Purchase Order Product Routes ---

// router.post(
//   '/purchase-orders/:poId/products',
//   validate(poIdParamsSchema, 'params'),
//   validate(createPoProductBodySchema, 'body'),
//   createPoProduct,
// );

router.get(
  '/purchase-orders/:poId/products',
  validate(poIdParamsSchema, 'params'),
  listPoProducts,
);

// router.put(
//   '/purchase-orders/:poId/products/:productId',
//   validate(poProductIdParamsSchema, 'params'),
//   validate(updatePoProductBodySchema, 'body'),
//   updatePoProduct,
// );

// router.delete(
//   '/purchase-orders/:poId/products/:productId',
//   validate(poProductIdParamsSchema, 'params'),
//   deletePoProduct,
// );

export default router;
