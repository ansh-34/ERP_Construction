import { Router } from 'express';
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
  validate(listGeneralLedgerQuerySchema, 'query'),
  listGeneralLedgerEntries,
);
generalLedgerRouter.get(
  '/:id',
  validate(generalLedgerIdParamSchema, 'params'),
  getGeneralLedgerEntryById,
);

export default generalLedgerRouter;
