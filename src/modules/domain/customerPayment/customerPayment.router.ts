import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import {
  createCustomerPayment,
  deleteCustomerPayment,
  getCustomerPaymentById,
  listCustomerPayments,
  updateCustomerPayment,
} from './customerPayment.controller.js';
import {
  createCustomerPaymentBodySchema,
  customerPaymentIdParamSchema,
  listCustomerPaymentsQuerySchema,
  updateCustomerPaymentBodySchema,
} from './customerPayment.validator.js';

const customerPaymentRouter = Router();

customerPaymentRouter.post(
  '/',
  validate(createCustomerPaymentBodySchema, 'body'),
  createCustomerPayment,
);

customerPaymentRouter.get(
  '/',
  validate(listCustomerPaymentsQuerySchema, 'query'),
  listCustomerPayments,
);

customerPaymentRouter.get(
  '/:id',
  validate(customerPaymentIdParamSchema, 'params'),
  getCustomerPaymentById,
);

customerPaymentRouter.put(
  '/:id',
  validate(customerPaymentIdParamSchema, 'params'),
  validate(updateCustomerPaymentBodySchema, 'body'),
  updateCustomerPayment,
);

customerPaymentRouter.delete(
  '/:id',
  validate(customerPaymentIdParamSchema, 'params'),
  deleteCustomerPayment,
);

export default customerPaymentRouter;
