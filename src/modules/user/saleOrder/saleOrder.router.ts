import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createSaleOrder,
  listSaleOrders,
  getSaleOrderById,
  updateSaleOrder,
  deleteSaleOrder,
  listSaleOrderProducts,
  removeSaleOrderProduct,
} from './saleOrder.controller.js';
import {
  createSaleOrderBodySchema,
  updateSaleOrderBodySchema,
  listSaleOrdersQuerySchema,
  saleOrderIdParamsSchema,
  saleOrderProductParamsSchema,
} from './saleOrder.validator.js';

const router = Router();

router.post(
  '/',
  authorize('SALE_ORDER', 'CREATE'),
  validate(createSaleOrderBodySchema, 'body'),
  createSaleOrder,
);

router.get(
  '/',
  authorize('SALE_ORDER', 'READ'),
  validate(listSaleOrdersQuerySchema, 'query'),
  listSaleOrders,
);

router.get(
  '/:id/products',
  authorize('SALE_ORDER', 'READ'),
  validate(saleOrderIdParamsSchema, 'params'),
  listSaleOrderProducts,
);

router.delete(
  '/:id/products/:productId',
  authorize('SALE_ORDER', 'DELETE'),
  validate(saleOrderProductParamsSchema, 'params'),
  removeSaleOrderProduct,
);

router.get(
  '/:id',
  authorize('SALE_ORDER', 'READ'),
  validate(saleOrderIdParamsSchema, 'params'),
  getSaleOrderById,
);

router.put(
  '/:id',
  authorize('SALE_ORDER', 'UPDATE'),
  validate(saleOrderIdParamsSchema, 'params'),
  validate(updateSaleOrderBodySchema, 'body'),
  updateSaleOrder,
);

router.delete(
  '/:id',
  authorize('SALE_ORDER', 'DELETE'),
  validate(saleOrderIdParamsSchema, 'params'),
  deleteSaleOrder,
);

export default router;
