import { Router } from 'express';
// import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createProduct,
  listProducts,
  getProductById,
  deleteProduct,
  updateProduct,
  bulkUpdateGrades,
  bulkUpdateStandardRates,
} from './product.controller.js';
import {
  createProductBodySchema,
  listProductsQuerySchema,
  productIdParamsSchema,
  updateProductBodySchema,
  bulkUpdateGradesBodySchema,
  bulkUpdateStdRatesBodySchema,
} from './product.validator.js';
import { productGradeRouter } from '../productGrade/productGrade.router.js';
import { listAllDomainProductGrades } from '../productGrade/productGrade.controller.js';
import { productUomRouter } from '../productUom/productUom.router.js';

const router = Router();

router.post(
  '/',
  // authorize('product', 'create'),
  validate(createProductBodySchema, 'body'),
  createProduct,
);
router.get(
  '/',
  // authorize('product', 'read'),
  validate(listProductsQuerySchema, 'query'),
  listProducts,
);
router.get(
  '/grades',
  // authorize('product', 'read'),
  validate(listProductsQuerySchema, 'query'), // reusing the same query schema since it has page, limit, searchKey, etc.
  listAllDomainProductGrades,
);
router.get(
  '/:id',
  // authorize('product', 'read'),
  validate(productIdParamsSchema, 'params'),
  getProductById,
);
router.put(
  '/:id',
  // authorize('product', 'update'),
  validate(productIdParamsSchema, 'params'),
  validate(updateProductBodySchema, 'body'),
  updateProduct,
);
router.delete(
  '/:id',
  // authorize('product', 'delete'),
  validate(productIdParamsSchema, 'params'),
  deleteProduct,
);

// ── Standalone bulk-update endpoints ─────────────────────────
router.put(
  '/:id/grades',
  // authorize('product', 'update'),
  validate(productIdParamsSchema, 'params'),
  validate(bulkUpdateGradesBodySchema, 'body'),
  bulkUpdateGrades,
);
router.put(
  '/:id/standard-rates',
  // authorize('product', 'update'),
  validate(productIdParamsSchema, 'params'),
  validate(bulkUpdateStdRatesBodySchema, 'body'),
  bulkUpdateStandardRates,
);

router.use('/:productId/grades', productGradeRouter());
router.use('/:productId/uoms', productUomRouter());

export default router;
