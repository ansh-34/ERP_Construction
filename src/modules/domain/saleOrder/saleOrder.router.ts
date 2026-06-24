import { Router } from 'express';
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

router.post('/', validate(createSaleOrderBodySchema, 'body'), createSaleOrder);

router.get('/', validate(listSaleOrdersQuerySchema, 'query'), listSaleOrders);

router.get(
  '/:id/products',
  validate(saleOrderIdParamsSchema, 'params'),
  listSaleOrderProducts,
);

router.delete(
  '/:id/products/:productId',
  validate(saleOrderProductParamsSchema, 'params'),
  removeSaleOrderProduct,
);

router.get(
  '/:id',
  validate(saleOrderIdParamsSchema, 'params'),
  getSaleOrderById,
);

router.put(
  '/:id',
  validate(saleOrderIdParamsSchema, 'params'),
  validate(updateSaleOrderBodySchema, 'body'),
  updateSaleOrder,
);

router.delete(
  '/:id',
  validate(saleOrderIdParamsSchema, 'params'),
  deleteSaleOrder,
);

export default router;
