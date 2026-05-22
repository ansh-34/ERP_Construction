import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createProductGrade,
  listProductGrades,
  listProductGradesWithStdRates,
  getProductGradeById,
  updateProductGrade,
  deleteProductGrade,
} from './productGrade.controller.js';
import {
  createProductGradeBodySchema,
  updateProductGradeBodySchema,
  listProductGradeQuerySchema,
  productGradeProductIdParamSchema,
  productGradeIdParamSchema,
} from './productGrade.validation.js';
import { productGradeStdRateRouter } from '../productGradeStdRate/productGradeStdRate.router.js';

export const productGradeRouter = (): Router => {
  const router = Router({ mergeParams: true });

  router.post(
    '/',
    authorize('PRODUCT', 'CREATE'),
    validate(productGradeProductIdParamSchema, 'params'),
    validate(createProductGradeBodySchema, 'body'),
    createProductGrade,
  );
  router.get(
    '/',
    authorize('PRODUCT', 'READ'),
    validate(productGradeProductIdParamSchema, 'params'),
    validate(listProductGradeQuerySchema, 'query'),
    listProductGrades,
  );
  router.get(
    '/std-rates',
    authorize('PRODUCT', 'READ'),
    validate(productGradeProductIdParamSchema, 'params'),
    validate(listProductGradeQuerySchema, 'query'),
    listProductGradesWithStdRates,
  );
  router.get(
    '/:id',
    authorize('PRODUCT', 'READ'),
    validate(productGradeIdParamSchema, 'params'),
    getProductGradeById,
  );
  router.put(
    '/:id',
    authorize('PRODUCT', 'UPDATE'),
    validate(productGradeIdParamSchema, 'params'),
    validate(updateProductGradeBodySchema, 'body'),
    updateProductGrade,
  );
  router.delete(
    '/:id',
    authorize('PRODUCT', 'DELETE'),
    validate(productGradeIdParamSchema, 'params'),
    deleteProductGrade,
  );

  router.use('/:gradeId/std-rates', productGradeStdRateRouter());

  return router;
};
