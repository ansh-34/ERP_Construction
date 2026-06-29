import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  getGeneralLedgerEntryById,
  listGeneralLedgerEntries,
} from './generalLedger.controller.js';
import {
  generalLedgerIdParamSchema,
  listGeneralLedgerQuerySchema,
} from './generalLedger.validator.js';

const generalLedgerRouter = Router();

generalLedgerRouter.get(
  '/',
  authorize('GENERAL_LEDGER', 'READ'),
  validate(listGeneralLedgerQuerySchema, 'query'),
  listGeneralLedgerEntries,
);
generalLedgerRouter.get(
  '/:id',
  authorize('GENERAL_LEDGER', 'READ'),
  validate(generalLedgerIdParamSchema, 'params'),
  getGeneralLedgerEntryById,
);

export default generalLedgerRouter;
