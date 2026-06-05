import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
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
  validate(createPaymentRequestBodySchema, 'body'),
  createPaymentRequest,
);

router.get(
  '/',
  validate(listPaymentRequestsQuerySchema, 'query'),
  listPaymentRequests,
);

router.get(
  '/:id',
  validate(paymentRequestIdParamsSchema, 'params'),
  getPaymentRequestById,
);

router.put(
  '/:id',
  validate(paymentRequestIdParamsSchema, 'params'),
  validate(updatePaymentRequestBodySchema, 'body'),
  updatePaymentRequest,
);

router.delete(
  '/:id',
  validate(paymentRequestIdParamsSchema, 'params'),
  deletePaymentRequest,
);

export default router;
