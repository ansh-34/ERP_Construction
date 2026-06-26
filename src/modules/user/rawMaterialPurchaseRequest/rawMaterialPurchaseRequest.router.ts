import { Router } from 'express';
import authorize from '@/middlewares/authorize.js';
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
  exportPurchaseOrderById,
  listPoProducts,
  listAllPoProducts,
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
  exportPurchaseOrderQuerySchema,
  poProductsQuerySchema,
} from './rawMaterialPurchaseRequest.validator.js';

const router = Router();

router.post(
  '/',
  authorize('RMPR', 'CREATE'),
  validate(createRawMaterialPurchaseRequestBodySchema, 'body'),
  createRawMaterialPurchaseRequest,
);

router.get(
  '/',
  authorize('RMPR', 'READ'),
  validate(listRawMaterialPurchaseRequestsQuerySchema, 'query'),
  listRawMaterialPurchaseRequests,
);

// Single endpoint for bulk approve/reject by code
router.put(
  '/approval',
  authorize('RMPR', 'APPROVE'),
  validate(approveRejectBodySchema, 'body'),
  approveOrRejectRawMaterialPurchaseRequests,
);

router.get(
  '/code/:code',
  authorize('RMPR', 'READ'),
  validate(rawMaterialPurchaseRequestCodeParamsSchema, 'params'),
  getRawMaterialPurchaseRequestByCode,
);

router.delete(
  '/code/:code',
  authorize('RMPR', 'DELETE'),
  validate(rawMaterialPurchaseRequestCodeParamsSchema, 'params'),
  deleteRawMaterialPurchaseRequestByCode,
);

router.put(
  '/code/:code/product/:productId',
  authorize('RMPR', 'UPDATE'),
  validate(updateRawMaterialPurchaseRequestByCodeParamsSchema, 'params'),
  validate(updateRawMaterialPurchaseRequestBodySchema, 'body'),
  updateRawMaterialPurchaseRequestByCodeAndProduct,
);

// --- Purchase Order Routes ---

router.get(
  '/po',
  authorize('PO', 'READ'),
  validate(listPurchaseOrdersQuerySchema, 'query'),
  listPurchaseOrders,
);

router.get(
  '/po/products',
  authorize('POP', 'READ'),
  validate(poProductsQuerySchema, 'params'),
  listAllPoProducts,
);

router.get(
  '/po/:poId/export',
  authorize('PO', 'READ'),
  validate(poIdParamsSchema, 'params'),
  validate(exportPurchaseOrderQuerySchema, 'query'),
  exportPurchaseOrderById,
);

router.get(
  '/po/:poId',
  authorize('PO', 'READ'),
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
  authorize('POP', 'READ'),
  validate(poIdParamsSchema, 'params'),
  listPoProducts,
);

// --- Raw Material Purchase Request Routes by ID ---

router.get(
  '/:id',
  authorize('RMPR', 'READ'),
  validate(rawMaterialPurchaseRequestIdParamsSchema, 'params'),
  getRawMaterialPurchaseRequestById,
);

router.put(
  '/:id',
  authorize('RMPR', 'UPDATE'),
  validate(rawMaterialPurchaseRequestIdParamsSchema, 'params'),
  validate(updateRawMaterialPurchaseRequestBodySchema, 'body'),
  updateRawMaterialPurchaseRequest,
);

router.delete(
  '/:id',
  authorize('RMPR', 'DELETE'),
  validate(rawMaterialPurchaseRequestIdParamsSchema, 'params'),
  deleteRawMaterialPurchaseRequest,
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
