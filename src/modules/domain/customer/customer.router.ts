import { Router } from 'express';
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
  validate(createCustomerBodySchema, 'body'),
  createCustomer,
);
customerRouter.get(
  '/',
  validate(listCustomersQuerySchema, 'query'),
  listCustomers,
);
customerRouter.get(
  '/:id',
  validate(customerIdParamSchema, 'params'),
  getCustomerById,
);
customerRouter.put(
  '/:id',
  validate(customerIdParamSchema, 'params'),
  validate(updateCustomerBodySchema, 'body'),
  updateCustomer,
);
customerRouter.delete(
  '/:id',
  validate(customerIdParamSchema, 'params'),
  deleteCustomer,
);

export default customerRouter;
