import { Router } from 'express';
import authMiddleware from '../../../middlewares/auth.js';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createProduct,
  listProducts,
  getProductById,
  deleteProduct,
} from './product.controller.js';
import {
  createProductBodySchema,
  listProductsQuerySchema,
  productIdParamsSchema,
} from './product.validator.js';

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
router.delete(
  '/:id',
  authorize('product', 'delete'),
  validate(productIdParamsSchema, 'params'),
  deleteProduct,
);

export default router;
