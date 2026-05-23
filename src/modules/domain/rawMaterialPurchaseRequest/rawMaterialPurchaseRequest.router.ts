import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import {
  createRawMaterialPurchaseRequest,
  listRawMaterialPurchaseRequests,
  getRawMaterialPurchaseRequestById,
  getRawMaterialPurchaseRequestByCode,
  updateRawMaterialPurchaseRequest,
  deleteRawMaterialPurchaseRequest,
  deleteRawMaterialPurchaseRequestByCode,
  updateRawMaterialPurchaseRequestByCodeAndProduct,
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
  rawMaterialPurchaseRequestCodeParamsSchema,
  updateRawMaterialPurchaseRequestByCodeParamsSchema,
  approveRejectBodySchema,
  listPurchaseOrdersQuerySchema,
  poIdParamsSchema,
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

// Single endpoint for bulk approve/reject by code
router.put(
  '/approval',
  // authorize('rawMaterialPurchaseRequest', 'approve'),
  validate(approveRejectBodySchema, 'body'),
  approveOrRejectRawMaterialPurchaseRequests,
);

router.get(
  '/code/:code',
  // authorize('rawMaterialPurchaseRequest', 'read'),
  validate(rawMaterialPurchaseRequestCodeParamsSchema, 'params'),
  getRawMaterialPurchaseRequestByCode,
);

router.delete(
  '/code/:code',
  // authorize('rawMaterialPurchaseRequest', 'delete'),
  validate(rawMaterialPurchaseRequestCodeParamsSchema, 'params'),
  deleteRawMaterialPurchaseRequestByCode,
);

router.put(
  '/code/:code/product/:productId',
  // authorize('rawMaterialPurchaseRequest', 'update'),
  validate(updateRawMaterialPurchaseRequestByCodeParamsSchema, 'params'),
  validate(updateRawMaterialPurchaseRequestBodySchema, 'body'),
  updateRawMaterialPurchaseRequestByCodeAndProduct,
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
  '/po',
  validate(listPurchaseOrdersQuerySchema, 'query'),
  listPurchaseOrders,
);

router.get(
  '/po/:poId',
  validate(poIdParamsSchema, 'params'),
  getPurchaseOrderById,
);

// router.put(
//   '/po/:poId',
//   validate(poIdParamsSchema, 'params'),
//   validate(updatePurchaseOrderBodySchema, 'body'),
//   updatePurchaseOrder,
// );

// --- Purchase Order Product Routes ---

// router.post(
//   '/po/:poId/products',
//   validate(poIdParamsSchema, 'params'),
//   validate(createPoProductBodySchema, 'body'),
//   createPoProduct,
// );

router.get(
  '/po/:poId/products',
  validate(poIdParamsSchema, 'params'),
  listPoProducts,
);

// router.put(
//   '/po/:poId/products/:productId',kil
//   validate(poProductIdParamsSchema, 'params'),
//   validate(updatePoProductBodySchema, 'body'),
//   updatePoProduct,
// );

// router.delete(
//   '/po/:poId/products/:productId',
//   validate(poProductIdParamsSchema, 'params'),
//   deletePoProduct,
// );

export default router;
