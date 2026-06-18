import { Router } from 'express';
// import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createProductGrade,
  listProductGrades,
  listProductGradesWithLastPurchaseRates,
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
    '/last-purchase-rates',
    validate(productGradeProductIdParamSchema, 'params'),
    validate(listProductGradeQuerySchema, 'query'),
    listProductGradesWithLastPurchaseRates,
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

  return router;
};
