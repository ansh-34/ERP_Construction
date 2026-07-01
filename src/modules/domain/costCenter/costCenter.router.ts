import { Router } from 'express';
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
  validate(createCostCenterBodySchema, 'body'),
  createCostCenter,
);
costCenterRouter.get(
  '/',
  validate(listCostCentersQuerySchema, 'query'),
  listCostCenters,
);
costCenterRouter.get(
  '/:id',
  validate(costCenterIdParamSchema, 'params'),
  getCostCenterById,
);
costCenterRouter.put(
  '/:id',
  validate(costCenterIdParamSchema, 'params'),
  validate(updateCostCenterBodySchema, 'body'),
  updateCostCenter,
);
costCenterRouter.delete(
  '/:id',
  validate(costCenterIdParamSchema, 'params'),
  deleteCostCenter,
);

export default costCenterRouter;
