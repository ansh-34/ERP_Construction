import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import authorize from '../../../middlewares/authorize.js';
import {
  createPaymentRequest,
  listPaymentRequests,
  getPaymentRequestById,
  updatePaymentRequest,
  deletePaymentRequest,
} from './paymentRequest.controller.js';
import {
  createPaymentRequestBodySchema,
  listPaymentRequestsQuerySchema,
  paymentRequestIdParamsSchema,
  updatePaymentRequestBodySchema,
} from './paymentRequest.validator.js';

const router = Router();

router.post(
  '/',
  authorize('PAYMENT_REQUEST', 'CREATE'),
  validate(createPaymentRequestBodySchema, 'body'),
  createPaymentRequest,
);

router.get(
  '/',
  authorize('PAYMENT_REQUEST', 'READ'),
  validate(listPaymentRequestsQuerySchema, 'query'),
  listPaymentRequests,
);

router.get(
  '/:id',
  authorize('PAYMENT_REQUEST', 'READ'),
  validate(paymentRequestIdParamsSchema, 'params'),
  getPaymentRequestById,
);

router.put(
  '/:id',
  authorize('PAYMENT_REQUEST', 'UPDATE'),
  validate(paymentRequestIdParamsSchema, 'params'),
  validate(updatePaymentRequestBodySchema, 'body'),
  updatePaymentRequest,
);

router.delete(
  '/:id',
  authorize('PAYMENT_REQUEST', 'DELETE'),
  validate(paymentRequestIdParamsSchema, 'params'),
  deletePaymentRequest,
);

export default router;
