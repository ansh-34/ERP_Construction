import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createGrn,
  listGrns,
  getGrnById,
  exportGrnById,
  updateGrn,
  deleteGrn,
  approveOrRejectGrn,
  createGrnProduct,
  listGrnProducts,
  updateGrnProduct,
  deleteGrnProduct,
} from './grn.controller.js';
import {
  createGrnBodySchema,
  updateGrnBodySchema,
  listGrnsQuerySchema,
  grnIdParamsSchema,
  exportGrnQuerySchema,
  approveRejectGrnBodySchema,
  createGrnProductBodySchema,
  updateGrnProductBodySchema,
  grnProductIdParamsSchema,
} from './grn.validator.js';

const router = Router();

router.post(
  '/',
  authorize('GRN', 'CREATE'),
  validate(createGrnBodySchema, 'body'),
  createGrn,
);

router.get(
  '/',
  authorize('GRN', 'READ'),
  validate(listGrnsQuerySchema, 'query'),
  listGrns,
);

router.get(
  '/:id/export',
  authorize('GRN', 'READ'),
  validate(grnIdParamsSchema, 'params'),
  validate(exportGrnQuerySchema, 'query'),
  exportGrnById,
);

router.get(
  '/:id',
  authorize('GRN', 'READ'),
  validate(grnIdParamsSchema, 'params'),
  getGrnById,
);

router.put(
  '/:id',
  authorize('GRN', 'UPDATE'),
  validate(grnIdParamsSchema, 'params'),
  validate(updateGrnBodySchema, 'body'),
  updateGrn,
);

router.delete(
  '/:id',
  authorize('GRN', 'DELETE'),
  validate(grnIdParamsSchema, 'params'),
  deleteGrn,
);

router.put(
  '/:id/approval',
  authorize('GRN', 'APPROVE'),
  validate(grnIdParamsSchema, 'params'),
  validate(approveRejectGrnBodySchema, 'body'),
  approveOrRejectGrn,
);

// --- Product Routes ---

router.post(
  '/:id/products',
  authorize('GRN', 'CREATE'),
  validate(grnIdParamsSchema, 'params'),
  validate(createGrnProductBodySchema, 'body'),
  createGrnProduct,
);

router.get(
  '/:id/products',
  authorize('GRN', 'READ'),
  validate(grnIdParamsSchema, 'params'),
  listGrnProducts,
);

router.put(
  '/:id/products/:productId',
  authorize('GRN', 'UPDATE'),
  validate(grnProductIdParamsSchema, 'params'),
  validate(updateGrnProductBodySchema, 'body'),
  updateGrnProduct,
);

router.delete(
  '/:id/products/:productId',
  authorize('GRN', 'DELETE'),
  validate(grnProductIdParamsSchema, 'params'),
  deleteGrnProduct,
);

export default router;
