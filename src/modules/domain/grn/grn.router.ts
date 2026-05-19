import { Router } from 'express';
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
  createGrnProductBodySchema,
  updateGrnProductBodySchema,
  grnProductIdParamsSchema,
} from './grn.validator.js';

const router = Router();

router.post('/', validate(createGrnBodySchema, 'body'), createGrn);

router.get('/', validate(listGrnsQuerySchema, 'query'), listGrns);

router.get('/:id', validate(grnIdParamsSchema, 'params'), getGrnById);

router.put(
  '/:id',
  validate(grnIdParamsSchema, 'params'),
  validate(updateGrnBodySchema, 'body'),
  updateGrn,
);

router.delete('/:id', validate(grnIdParamsSchema, 'params'), deleteGrn);

router.put(
  '/:id/approval',
  validate(grnIdParamsSchema, 'params'),
  validate(approveRejectGrnBodySchema, 'body'),
  approveOrRejectGrn,
);

// --- Product Routes ---

// router.post(
//   '/:id/products',
//   validate(grnIdParamsSchema, 'params'),
//   validate(createGrnProductBodySchema, 'body'),
//   createGrnProduct,
// );

router.get(
  '/:id/products',
  validate(grnIdParamsSchema, 'params'),
  listGrnProducts,
);

// router.put(
//   '/:id/products/:productId',
//   validate(grnProductIdParamsSchema, 'params'),
//   validate(updateGrnProductBodySchema, 'body'),
//   updateGrnProduct,
// );

// router.delete(
//   '/:id/products/:productId',
//   validate(grnProductIdParamsSchema, 'params'),
//   deleteGrnProduct,
// );

export default router;
