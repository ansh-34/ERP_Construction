import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
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
  productUomProductIdParamSchema,
} from './productUom.validation.js';

export const productUomRouter = (): Router => {
  const router = Router({ mergeParams: true });

  router.post(
    '/',
    authorize('PRODUCT', 'CREATE'),
    validate(productUomProductIdParamSchema, 'params'),
    validate(createProductUomBodySchema, 'body'),
    createProductUom,
  );
  router.get(
    '/',
    authorize('PRODUCT', 'READ'),
    validate(productUomProductIdParamSchema, 'params'),
    validate(listProductUomQuerySchema, 'query'),
    listProductUoms,
  );
  router.get(
    '/:id',
    authorize('PRODUCT', 'READ'),
    validate(productUomIdParamSchema, 'params'),
    getProductUomById,
  );
  router.delete(
    '/:id',
    authorize('PRODUCT', 'DELETE'),
    validate(productUomIdParamSchema, 'params'),
    deleteProductUom,
  );

  return router;
};
