import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import {
  createCustomerRate,
  deleteCustomerRate,
  getCustomerRateById,
  listCustomerRates,
  updateCustomerRate,
} from './customerRate.controller.js';
import {
  createCustomerRateBodySchema,
  customerRateIdParamSchema,
  listCustomerRatesQuerySchema,
  updateCustomerRateBodySchema,
} from './customerRate.validator.js';

const customerRateRouter = Router();

customerRateRouter.post(
  '/',
  validate(createCustomerRateBodySchema, 'body'),
  createCustomerRate,
);
customerRateRouter.get(
  '/',
  validate(listCustomerRatesQuerySchema, 'query'),
  listCustomerRates,
);
customerRateRouter.get(
  '/:id',
  validate(customerRateIdParamSchema, 'params'),
  getCustomerRateById,
);
customerRateRouter.put(
  '/:id',
  validate(customerRateIdParamSchema, 'params'),
  validate(updateCustomerRateBodySchema, 'body'),
  updateCustomerRate,
);
customerRateRouter.delete(
  '/:id',
  validate(customerRateIdParamSchema, 'params'),
  deleteCustomerRate,
);

export default customerRateRouter;
