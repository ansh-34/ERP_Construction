import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createUom,
  listUoms,
  getUomById,
  updateUom,
  deleteUom,
} from './uom.controller.js';
import {
  createUomBodySchema,
  listUomsQuerySchema,
  uomIdParamSchema,
  updateUomBodySchema,
} from './uom.validation.js';

export const uomRouter = (): Router => {
  const router = Router();

  router.post(
    '/',
    authorize('UOM', 'CREATE'),
    validate(createUomBodySchema, 'body'),
    createUom,
  );

  router.get(
    '/',
    authorize('UOM', 'READ'),
    validate(listUomsQuerySchema, 'query'),
    listUoms,
  );

  router.get(
    '/:id',
    authorize('UOM', 'READ'),
    validate(uomIdParamSchema, 'params'),
    getUomById,
  );

  router.put(
    '/:id',
    authorize('UOM', 'UPDATE'),
    validate(uomIdParamSchema, 'params'),
    validate(updateUomBodySchema, 'body'),
    updateUom,
  );

  router.delete(
    '/:id',
    authorize('UOM', 'DELETE'),
    validate(uomIdParamSchema, 'params'),
    deleteUom,
  );

  return router;
};
