import { Router } from 'express';
// import authorize from '../../../middlewares/authorize.js';
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
  productGradeProductIdParamSchema,
  productGradeIdParamSchema,
} from './productGrade.validation.js';
import { productGradeStdRateRouter } from '../productGradeStdRate/productGradeStdRate.router.js';

export const productGradeRouter = (): Router => {
  const router = Router({ mergeParams: true });

  router.post(
    '/',
    validate(productGradeProductIdParamSchema, 'params'),
    validate(createProductGradeBodySchema, 'body'),
    createProductGrade,
  );
  router.get(
    '/',
    validate(productGradeProductIdParamSchema, 'params'),
    validate(listProductGradeQuerySchema, 'query'),
    listProductGrades,
  );
  router.get(
    '/:id',
    // authorize('product', 'read'),
    validate(productGradeIdParamSchema, 'params'),
    getProductGradeById,
  );
  router.put(
    '/:id',
    // authorize('product', 'update'),
    validate(productGradeIdParamSchema, 'params'),
    validate(updateProductGradeBodySchema, 'body'),
    updateProductGrade,
  );
  router.delete(
    '/:id',
    // authorize('product', 'delete'),
    validate(productGradeIdParamSchema, 'params'),
    deleteProductGrade,
  );

  router.use('/:gradeId/std-rates', productGradeStdRateRouter());

  return router;
};
