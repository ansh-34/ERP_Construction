import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createGrn,
  listGrns,
  getGrnById,
  updateGrn,
  deleteGrn,
  approveOrRejectGrn,
  // createGrnProduct,
  listGrnProducts,
  // updateGrnProduct,
  // deleteGrnProduct,
} from './grn.controller.js';
import {
  createGrnBodySchema,
  updateGrnBodySchema,
  listGrnsQuerySchema,
  grnIdParamsSchema,
  approveRejectGrnBodySchema,
} from './grn.validator.js';

const router = Router();

router.post(
  '/',
  authorize('INVENTORY', 'CREATE'),
  validate(createGrnBodySchema, 'body'),
  createGrn,
);

router.get(
  '/',
  authorize('INVENTORY', 'READ'),
  validate(listGrnsQuerySchema, 'query'),
  listGrns,
);

router.get(
  '/:id',
  authorize('INVENTORY', 'READ'),
  validate(grnIdParamsSchema, 'params'),
  getGrnById,
);

router.put(
  '/:id',
  authorize('INVENTORY', 'UPDATE'),
  validate(grnIdParamsSchema, 'params'),
  validate(updateGrnBodySchema, 'body'),
  updateGrn,
);

router.delete(
  '/:id',
  authorize('INVENTORY', 'DELETE'),
  validate(grnIdParamsSchema, 'params'),
  deleteGrn,
);

router.put(
  '/:id/approval',
  authorize('INVENTORY', 'APPROVE'), // need to chech oermission later
  validate(grnIdParamsSchema, 'params'),
  validate(approveRejectGrnBodySchema, 'body'),
  approveOrRejectGrn,
);

// --- Product Routes ---

// router.post(
//   '/:id/products',
//   authorize('INVENTORY', 'CREATE'),
//   validate(grnIdParamsSchema, 'params'),
//   validate(createGrnProductBodySchema, 'body'),
//   createGrnProduct,
// );

router.get(
  '/:id/products',
  authorize('INVENTORY', 'READ'),
  validate(grnIdParamsSchema, 'params'),
  listGrnProducts,
);

// router.put(
//   '/:id/products/:productId',
//   authorize('INVENTORY', 'UPDATE'),
//   validate(grnProductIdParamsSchema, 'params'),
//   validate(updateGrnProductBodySchema, 'body'),
//   updateGrnProduct,
// );

// router.delete(
//   '/:id/products/:productId',
//   authorize('INVENTORY', 'DELETE'),
//   validate(grnProductIdParamsSchema, 'params'),
//   deleteGrnProduct,
// );

export default router;
