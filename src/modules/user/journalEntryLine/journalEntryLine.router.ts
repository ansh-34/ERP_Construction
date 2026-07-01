import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
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
  authorize('JOURNAL_ENTRY_LINE', 'CREATE'),
  validate(createJournalEntryLineBodySchema, 'body'),
  createJournalEntryLine,
);
router.get(
  '/',
  authorize('JOURNAL_ENTRY_LINE', 'READ'),
  validate(listJournalEntryLinesQuerySchema, 'query'),
  listJournalEntryLines,
);
router.get(
  '/:id',
  authorize('JOURNAL_ENTRY_LINE', 'READ'),
  validate(journalEntryLineIdParamSchema, 'params'),
  getJournalEntryLine,
);
router.put(
  '/:id',
  authorize('JOURNAL_ENTRY_LINE', 'UPDATE'),
  validate(journalEntryLineIdParamSchema, 'params'),
  validate(updateJournalEntryLineBodySchema, 'body'),
  updateJournalEntryLine,
);
router.delete(
  '/:id',
  authorize('JOURNAL_ENTRY_LINE', 'DELETE'),
  validate(journalEntryLineIdParamSchema, 'params'),
  deleteJournalEntryLine,
);

export default router;
