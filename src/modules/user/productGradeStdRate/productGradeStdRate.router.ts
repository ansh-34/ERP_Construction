import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createProductGradeStdRate,
  listProductGradeStdRates,
  getProductGradeStdRateById,
  updateProductGradeStdRate,
  deleteProductGradeStdRate,
} from './productGradeStdRate.controller.js';
import {
  createProductGradeStdRateBodySchema,
  updateProductGradeStdRateBodySchema,
  listProductGradeStdRateQuerySchema,
  productGradeStdRateIdParamSchema,
  productGradeStdRateParentParamSchema,
} from './productGradeStdRate.validation.js';

export const productGradeStdRateRouter = (): Router => {
  const router = Router({ mergeParams: true });

  router.post(
    '/',
    authorize('PRODUCT', 'CREATE'),
    validate(productGradeStdRateParentParamSchema, 'params'),
    validate(createProductGradeStdRateBodySchema, 'body'),
    createProductGradeStdRate,
  );
  router.get(
    '/',
    authorize('PRODUCT', 'READ'),
    validate(productGradeStdRateParentParamSchema, 'params'),
    validate(listProductGradeStdRateQuerySchema, 'query'),
    listProductGradeStdRates,
  );
  router.get(
    '/:id',
    authorize('PRODUCT', 'READ'),
    validate(productGradeStdRateIdParamSchema, 'params'),
    getProductGradeStdRateById,
  );
  router.put(
    '/:id',
    authorize('PRODUCT', 'UPDATE'),
    validate(productGradeStdRateIdParamSchema, 'params'),
    validate(updateProductGradeStdRateBodySchema, 'body'),
    updateProductGradeStdRate,
  );
  router.delete(
    '/:id',
    authorize('PRODUCT', 'DELETE'),
    validate(productGradeStdRateIdParamSchema, 'params'),
    deleteProductGradeStdRate,
  );

  return router;
};
