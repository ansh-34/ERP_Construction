import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
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
  authorize('CUSTOMER_RATE', 'CREATE'),
  validate(createCustomerRateBodySchema, 'body'),
  createCustomerRate,
);
customerRateRouter.get(
  '/',
  authorize('CUSTOMER_RATE', 'READ'),
  validate(listCustomerRatesQuerySchema, 'query'),
  listCustomerRates,
);
customerRateRouter.get(
  '/:id',
  authorize('CUSTOMER_RATE', 'READ'),
  validate(customerRateIdParamSchema, 'params'),
  getCustomerRateById,
);
customerRateRouter.put(
  '/:id',
  authorize('CUSTOMER_RATE', 'UPDATE'),
  validate(customerRateIdParamSchema, 'params'),
  validate(updateCustomerRateBodySchema, 'body'),
  updateCustomerRate,
);
customerRateRouter.delete(
  '/:id',
  authorize('CUSTOMER_RATE', 'DELETE'),
  validate(customerRateIdParamSchema, 'params'),
  deleteCustomerRate,
);

export default customerRateRouter;
