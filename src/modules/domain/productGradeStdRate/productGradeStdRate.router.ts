import { Router } from 'express';
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
} from './productGradeStdRate.validation.js';

export const productGradeStdRateRouter = (): Router => {
  const router = Router({ mergeParams: true });

  router.post('/', validate(createProductGradeStdRateBodySchema, 'body'), createProductGradeStdRate);
  router.get('/', validate(listProductGradeStdRateQuerySchema, 'query'), listProductGradeStdRates);
  router.get('/:id', validate(productGradeStdRateIdParamSchema, 'params'), getProductGradeStdRateById);
  router.patch('/:id', validate(updateProductGradeStdRateBodySchema, 'body'), updateProductGradeStdRate);
  router.delete('/:id', validate(productGradeStdRateIdParamSchema, 'params'), deleteProductGradeStdRate);

  return router;
};