import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import {
  listProductGradeLastPurchaseRates,
  getProductGradeLastPurchaseRateById,
} from './productGradeLastPurchaseRate.controller.js';
import {
  listProductGradeLastPurchaseRateQuerySchema,
  productGradeLastPurchaseRateIdParamSchema,
} from './productGradeLastPurchaseRate.validation.js';

export const productGradeLastPurchaseRateRouter = (): Router => {
  const router = Router({ mergeParams: true });

  router.get(
    '/',
    validate(listProductGradeLastPurchaseRateQuerySchema, 'query'),
    listProductGradeLastPurchaseRates,
  );
  router.get(
    '/:id',
    validate(productGradeLastPurchaseRateIdParamSchema, 'params'),
    getProductGradeLastPurchaseRateById,
  );

  return router;
};
