import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createCostCenter,
  deleteCostCenter,
  getCostCenterById,
  listCostCenters,
  updateCostCenter,
} from './costCenter.controller.js';
import {
  costCenterIdParamSchema,
  createCostCenterBodySchema,
  listCostCentersQuerySchema,
  updateCostCenterBodySchema,
} from './costCenter.validator.js';

const costCenterRouter = Router();

costCenterRouter.post(
  '/',
  authorize('COST_CENTER', 'CREATE'),
  validate(createCostCenterBodySchema, 'body'),
  createCostCenter,
);
costCenterRouter.get(
  '/',
  authorize('COST_CENTER', 'READ'),
  validate(listCostCentersQuerySchema, 'query'),
  listCostCenters,
);
costCenterRouter.get(
  '/:id',
  authorize('COST_CENTER', 'READ'),
  validate(costCenterIdParamSchema, 'params'),
  getCostCenterById,
);
costCenterRouter.put(
  '/:id',
  authorize('COST_CENTER', 'UPDATE'),
  validate(costCenterIdParamSchema, 'params'),
  validate(updateCostCenterBodySchema, 'body'),
  updateCostCenter,
);
costCenterRouter.delete(
  '/:id',
  authorize('COST_CENTER', 'DELETE'),
  validate(costCenterIdParamSchema, 'params'),
  deleteCostCenter,
);

export default costCenterRouter;
