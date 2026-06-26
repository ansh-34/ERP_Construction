import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import {
  listInvoices,
  listActiveInvoices,
  getInvoiceById,
  exportInvoiceById,
  getActiveInvoiceById,
  deleteInvoice,
  listInvoiceItems,
  generateInvoicesFromPO,
  finalizeInvoice,
  requestInvoicePdf,
  getInvoicePdfStatus,
} from './invoice.controller.js';
import {
  listInvoicesQuerySchema,
  invoiceIdParamsSchema,
  exportInvoiceQuerySchema,
  poIdParamsSchema,
  generateInvoicesBodySchema,
  finalizeInvoiceBodySchema,
} from './invoice.validator.js';

const router = Router();

router.post(
  '/po/:poId',
  // authorize('INVOICE', 'CREATE'),
  validate(poIdParamsSchema, 'params'),
  validate(generateInvoicesBodySchema, 'body'),
  generateInvoicesFromPO,
);

router.post(
  '/:id/finalize',
  // authorize('INVOICE', 'UPDATE'),
  validate(invoiceIdParamsSchema, 'params'),
  validate(finalizeInvoiceBodySchema, 'body'),
  finalizeInvoice,
);

router.get(
  '/',
  // authorize('INVOICE', 'READ'),
  validate(listInvoicesQuerySchema, 'query'),
  listInvoices,
);

router.get(
  '/active',
  // authorize('INVOICE', 'READ'),
  validate(listInvoicesQuerySchema, 'query'),
  listActiveInvoices,
);

router.get(
  '/active/:id',
  // authorize('INVOICE', 'READ'),
  validate(invoiceIdParamsSchema, 'params'),
  getActiveInvoiceById,
);

router.get(
  '/:id/export',
  // authorize('INVOICE', 'READ'),
  validate(invoiceIdParamsSchema, 'params'),
  validate(exportInvoiceQuerySchema, 'query'),
  exportInvoiceById,
);

router.get(
  '/:id',
  // authorize('INVOICE', 'READ'),
  validate(invoiceIdParamsSchema, 'params'),
  getInvoiceById,
);

router.delete(
  '/:id',
  // authorize('INVOICE', 'DELETE'),
  validate(invoiceIdParamsSchema, 'params'),
  deleteInvoice,
);

// --- Invoice Items ---

router.get(
  '/:id/items',
  // authorize('INVOICE', 'READ'),
  validate(invoiceIdParamsSchema, 'params'),
  listInvoiceItems,
);

// --- Invoice PDF ---

router.post(
  '/:id/pdf',
  // authorize('INVOICE', 'UPDATE'),
  validate(invoiceIdParamsSchema, 'params'),
  requestInvoicePdf,
);

router.get(
  '/:id/pdf',
  // authorize('INVOICE', 'READ'),
  validate(invoiceIdParamsSchema, 'params'),
  getInvoicePdfStatus,
);

export default router;
