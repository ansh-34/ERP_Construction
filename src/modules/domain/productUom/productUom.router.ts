import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import {
  createProductUom,
  listProductUoms,
  getProductUomById,
  deleteProductUom,
} from './productUom.controller.js';
import {
  createProductUomBodySchema,
  listProductUomQuerySchema,
  productUomIdParamSchema,
} from './productUom.validation.js';

export const productUomRouter = (): Router => {
  const router = Router({ mergeParams: true });

  router.post(
    '/',
    validate(createProductUomBodySchema, 'body'),
    createProductUom,
  );
  router.get(
    '/',
    validate(listProductUomQuerySchema, 'query'),
    listProductUoms,
  );
  router.get(
    '/:id',
    validate(productUomIdParamSchema, 'params'),
    getProductUomById,
  );
  router.delete(
    '/:id',
    validate(productUomIdParamSchema, 'params'),
    deleteProductUom,
  );

  return router;
};
