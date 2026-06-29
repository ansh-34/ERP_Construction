import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import {
  createJournalEntryLine,
  deleteJournalEntryLine,
  getJournalEntryLine,
  listJournalEntryLines,
  updateJournalEntryLine,
} from './journalEntryLine.controller.js';
import {
  createJournalEntryLineBodySchema,
  journalEntryLineIdParamSchema,
  listJournalEntryLinesQuerySchema,
  updateJournalEntryLineBodySchema,
} from './journalEntryLine.validator.js';

const router = Router();

router.post(
  '/',
  validate(createJournalEntryLineBodySchema, 'body'),
  createJournalEntryLine,
);
router.get(
  '/',
  validate(listJournalEntryLinesQuerySchema, 'query'),
  listJournalEntryLines,
);
router.get(
  '/:id',
  validate(journalEntryLineIdParamSchema, 'params'),
  getJournalEntryLine,
);
router.put(
  '/:id',
  validate(journalEntryLineIdParamSchema, 'params'),
  validate(updateJournalEntryLineBodySchema, 'body'),
  updateJournalEntryLine,
);
router.delete(
  '/:id',
  validate(journalEntryLineIdParamSchema, 'params'),
  deleteJournalEntryLine,
);

export default router;
