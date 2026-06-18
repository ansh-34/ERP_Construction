import { Router } from 'express';
// import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createProduct,
  getProductStats,
  listProducts,
  getProductById,
  deleteProduct,
  updateProduct,
  bulkUpdateGrades,
  bulkUpdateUoms,
} from './product.controller.js';
import {
  createProductBodySchema,
  listProductsQuerySchema,
  productIdParamsSchema,
  updateProductBodySchema,
  bulkUpdateGradesBodySchema,
  bulkUpdateUomsBodySchema,
} from './product.validator.js';
import { productGradeRouter } from '../productGrade/productGrade.router.js';
import { listAllDomainProductGrades } from '../productGrade/productGrade.controller.js';
import { productUomRouter } from '../productUom/productUom.router.js';
import { listAllDomainProductUoms } from '../productUom/productUom.controller.js';
import { listProductUomQuerySchema } from '../productUom/productUom.validation.js';

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
// aggregate statistics
router.get('/stats', /* authorize('product', 'read'), */ getProductStats);
router.get(
  '/grades',
  // authorize('product', 'read'),
  validate(listProductsQuerySchema, 'query'),
  listAllDomainProductGrades,
);
router.get(
  '/uoms',
  // authorize('product', 'read'),
  validate(listProductUomQuerySchema, 'query'),
  listAllDomainProductUoms,
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

router.put(
  '/:id/grades',
  // authorize('product', 'update'),
  validate(productIdParamsSchema, 'params'),
  validate(bulkUpdateGradesBodySchema, 'body'),
  bulkUpdateGrades,
);
router.put(
  '/:id/uoms',
  // authorize('product', 'update'),
  validate(productIdParamsSchema, 'params'),
  validate(bulkUpdateUomsBodySchema, 'body'),
  bulkUpdateUoms,
);

router.use('/:productId/grades', productGradeRouter());
router.use('/:productId/uoms', productUomRouter());

export default router;
