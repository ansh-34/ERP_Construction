import { Router } from 'express';
// import authorize from '../../../middlewares/authorize.js';
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
    // authorize('uom', 'create'),
    validate(createUomBodySchema, 'body'),
    createUom,
  );

  router.get(
    '/',
    // authorize('uom', 'read'),
    validate(listUomsQuerySchema, 'query'),
    listUoms,
  );

  router.get(
    '/:id',
    // authorize('uom', 'read'),
    validate(uomIdParamSchema, 'params'),
    getUomById,
  );

  router.put(
    '/:id',
    // authorize('uom', 'update'),
    validate(uomIdParamSchema, 'params'),
    validate(updateUomBodySchema, 'body'),
    updateUom,
  );

  router.delete(
    '/:id',
    // authorize('uom', 'delete'),
    validate(uomIdParamSchema, 'params'),
    deleteUom,
  );

  return router;
};
