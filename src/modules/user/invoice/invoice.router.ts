import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  listInvoices,
  getInvoiceById,
  deleteInvoice,
  listInvoiceItems,
  generateInvoicesFromPO,
  listAllInvoiceItems,
  requestInvoicePdf,
  getInvoicePdfStatus,
} from './invoice.controller.js';
import {
  listInvoicesQuerySchema,
  invoiceIdParamsSchema,
  poIdParamsSchema,
  generateInvoicesBodySchema,
  invoiceItemsQuerySchema,
} from './invoice.validator.js';

const router = Router();

router.post(
  '/po/:poId',
  authorize('INVOICE', 'CREATE'),
  validate(poIdParamsSchema, 'params'),
  validate(generateInvoicesBodySchema, 'body'),
  generateInvoicesFromPO,
);

router.get(
  '/',
  authorize('INVOICE', 'READ'),
  validate(listInvoicesQuerySchema, 'query'),
  listInvoices,
);

router.get(
  '/items',
  authorize('INVOICE', 'READ'),
  validate(invoiceItemsQuerySchema, 'query'),
  listAllInvoiceItems,
);

router.get(
  '/:id/items',
  authorize('INVOICE', 'READ'),
  validate(invoiceIdParamsSchema, 'params'),
  listInvoiceItems,
);

router.post(
  '/:id/pdf',
  authorize('INVOICE', 'UPDATE'),
  validate(invoiceIdParamsSchema, 'params'),
  requestInvoicePdf,
);

router.get(
  '/:id/pdf',
  authorize('INVOICE', 'READ'),
  validate(invoiceIdParamsSchema, 'params'),
  getInvoicePdfStatus,
);

router.get(
  '/:id',
  authorize('INVOICE', 'READ'),
  validate(invoiceIdParamsSchema, 'params'),
  getInvoiceById,
);

router.delete(
  '/:id',
  authorize('INVOICE', 'DELETE'),
  validate(invoiceIdParamsSchema, 'params'),
  deleteInvoice,
);

export default router;
