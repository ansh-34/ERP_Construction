import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createCustomer,
  deleteCustomer,
  getCustomerById,
  listCustomers,
  updateCustomer,
} from './customer.controller.js';
import {
  createCustomerBodySchema,
  customerIdParamSchema,
  listCustomersQuerySchema,
  updateCustomerBodySchema,
} from './customer.validator.js';

const customerRouter = Router();

customerRouter.post(
  '/',
  authorize('CUSTOMER', 'CREATE'),
  validate(createCustomerBodySchema, 'body'),
  createCustomer,
);
customerRouter.get(
  '/',
  authorize('CUSTOMER', 'READ'),
  validate(listCustomersQuerySchema, 'query'),
  listCustomers,
);
customerRouter.get(
  '/:id',
  authorize('CUSTOMER', 'READ'),
  validate(customerIdParamSchema, 'params'),
  getCustomerById,
);
customerRouter.put(
  '/:id',
  authorize('CUSTOMER', 'UPDATE'),
  validate(customerIdParamSchema, 'params'),
  validate(updateCustomerBodySchema, 'body'),
  updateCustomer,
);
customerRouter.delete(
  '/:id',
  authorize('CUSTOMER', 'DELETE'),
  validate(customerIdParamSchema, 'params'),
  deleteCustomer,
);

export default customerRouter;
