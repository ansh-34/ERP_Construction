import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import {
  createProductGrade,
  listProductGrades,
  getProductGradeById,
  updateProductGrade,
  deleteProductGrade,
} from './productGrade.controller.js';
import {
  createProductGradeBodySchema,
  updateProductGradeBodySchema,
  listProductGradeQuerySchema,
  productGradeIdParamSchema,
} from './productGrade.validation.js';
import { productGradeStdRateRouter } from '../productGradeStdRate/productGradeStdRate.router.js';

export const productGradeRouter = (): Router => {
  const router = Router({ mergeParams: true });

  router.post(
    '/',
    validate(createProductGradeBodySchema, 'body'),
    createProductGrade,
  );
  router.get(
    '/',
    validate(listProductGradeQuerySchema, 'query'),
    listProductGrades,
  );
  router.get(
    '/:id',
    validate(productGradeIdParamSchema, 'params'),
    getProductGradeById,
  );
  router.put(
    '/:id',
    validate(updateProductGradeBodySchema, 'body'),
    updateProductGrade,
  );
  router.delete(
    '/:id',
    validate(productGradeIdParamSchema, 'params'),
    deleteProductGrade,
  );

  router.use('/:gradeId/std-rates', productGradeStdRateRouter());

  return router;
};
