import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createProduct,
  listProducts,
  getProductById,
  deleteProduct,
  updateProduct,
  bulkUpdateGrades,
  bulkUpdateStandardRates,
  bulkUpdateUoms,
} from './product.controller.js';
import {
  createProductBodySchema,
  listProductsQuerySchema,
  productIdParamsSchema,
  updateProductBodySchema,
  bulkUpdateGradesBodySchema,
  bulkUpdateStdRatesBodySchema,
  bulkUpdateUomsBodySchema,
} from './product.validator.js';
import { productGradeRouter } from '../productGrade/productGrade.router.js';
import { listAllProductGrades } from '../productGrade/productGrade.controller.js';
import { listProductGradeQuerySchema } from '../productGrade/productGrade.validation.js';
import { productUomRouter } from '../productUom/productUom.router.js';
import { listAllDomainProductUoms } from '../productUom/productUom.controller.js';
import { listProductUomQuerySchema } from '../productUom/productUom.validation.js';
import { listAllProductGradeStdRates } from '../productGradeStdRate/productGradeStdRate.controller.js';

const router = Router();

router.post(
  '/',
  authorize('PRODUCT', 'CREATE'),
  validate(createProductBodySchema, 'body'),
  createProduct,
);
router.get(
  '/',
  authorize('PRODUCT', 'READ'),
  validate(listProductsQuerySchema, 'query'),
  listProducts,
);
router.get(
  '/grades',
  authorize('PRODUCT', 'READ'),
  validate(listProductGradeQuerySchema, 'query'),
  listAllProductGrades,
);
router.get(
  '/grades/std-rates',
  authorize('PRODUCT', 'READ'),
  validate(listProductGradeQuerySchema, 'query'),
  listAllProductGradeStdRates,
);
router.get(
  '/uoms',
  authorize('PRODUCT', 'READ'),
  validate(listProductUomQuerySchema, 'query'),
  listAllDomainProductUoms,
);
router.get(
  '/:id',
  authorize('PRODUCT', 'READ'),
  validate(productIdParamsSchema, 'params'),
  getProductById,
);
router.put(
  '/:id',
  authorize('PRODUCT', 'UPDATE'),
  validate(productIdParamsSchema, 'params'),
  validate(updateProductBodySchema, 'body'),
  updateProduct,
);
router.delete(
  '/:id',
  authorize('PRODUCT', 'DELETE'),
  validate(productIdParamsSchema, 'params'),
  deleteProduct,
);

router.put(
  '/:id/grades',
  authorize('PRODUCT', 'UPDATE'),
  validate(productIdParamsSchema, 'params'),
  validate(bulkUpdateGradesBodySchema, 'body'),
  bulkUpdateGrades,
);
router.put(
  '/:id/standard-rates',
  authorize('PRODUCT', 'UPDATE'),
  validate(productIdParamsSchema, 'params'),
  validate(bulkUpdateStdRatesBodySchema, 'body'),
  bulkUpdateStandardRates,
);

router.put(
  '/:id/uoms',
  authorize('PRODUCT', 'UPDATE'),
  validate(productIdParamsSchema, 'params'),
  validate(bulkUpdateUomsBodySchema, 'body'),
  bulkUpdateUoms,
);

router.use('/:productId/grades', productGradeRouter());
router.use('/:productId/uoms', productUomRouter());

export default router;
