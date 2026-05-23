import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import {
  listInvoices,
  getInvoiceById,
  deleteInvoice,
  listInvoiceItems,
  generateInvoicesFromPO,
} from './invoice.controller.js';
import {
  listInvoicesQuerySchema,
  invoiceIdParamsSchema,
  poIdParamsSchema,
  generateInvoicesBodySchema,
} from './invoice.validator.js';

const router = Router();

router.post(
  '/po/:poId',
  // authorize('INVOICE', 'CREATE'),
  validate(poIdParamsSchema, 'params'),
  validate(generateInvoicesBodySchema, 'body'),
  generateInvoicesFromPO,
);

router.get(
  '/',
  // authorize('INVOICE', 'READ'),
  validate(listInvoicesQuerySchema, 'query'),
  listInvoices,
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

export default router;
