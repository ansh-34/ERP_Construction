import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createProduct,
  listProducts,
  getProductById,
  deleteProduct,
  updateProduct,
} from './product.controller.js';
import {
  createProductBodySchema,
  listProductsQuerySchema,
  productIdParamsSchema,
  updateProductBodySchema,
} from './product.validator.js';
import { productGradeRouter } from '../productGrade/productGrade.router.js';
import { productUomRouter } from '../productUom/productUom.router.js';

const router = Router();

router.use(authMiddleware);

router.post(
  '/',
  authorize('product', 'create'),
  validate(createProductBodySchema, 'body'),
  createProduct,
);
router.get(
  '/',
  authorize('product', 'read'),
  validate(listProductsQuerySchema, 'query'),
  listProducts,
);
router.get(
  '/:id',
  authorize('product', 'read'),
  validate(productIdParamsSchema, 'params'),
  getProductById,
);
router.patch(
  '/:id',
  authorize('product', 'update'),
  validate(updateProductBodySchema, 'body'),
  updateProduct,
);
router.delete(
  '/:id',
  authorize('product', 'delete'),
  validate(productIdParamsSchema, 'params'),
  deleteProduct,
);

router.use('/:productId/grades', productGradeRouter());
router.use('/:productId/uoms', productUomRouter());

export default router;
