import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  listProductGradeLastPurchaseRates,
  getProductGradeLastPurchaseRateById,
} from './productGradeLastPurchaseRate.controller.js';
import {
  listProductGradeLastPurchaseRateQuerySchema,
  productGradeLastPurchaseRateIdParamSchema,
} from '../../domain/productGradeLastPurchaseRate/productGradeLastPurchaseRate.validation.js';

export const productGradeLastPurchaseRateRouter = (): Router => {
  const router = Router({ mergeParams: true });

  router.get(
    '/',
    authorize('PRODUCT', 'READ'),
    validate(listProductGradeLastPurchaseRateQuerySchema, 'query'),
    listProductGradeLastPurchaseRates,
  );
  router.get(
    '/:id',
    authorize('PRODUCT', 'READ'),
    validate(productGradeLastPurchaseRateIdParamSchema, 'params'),
    getProductGradeLastPurchaseRateById,
  );

  return router;
};
