import { Router } from 'express';
import authorize from '../../../middlewares/authorize.js';
import { validate } from '../../../middlewares/validate.js';
import {
  createJournalEntry,
  deleteJournalEntry,
  getJournalEntry,
  listJournalEntries,
  postJournalEntry,
  reverseJournalEntry,
  updateJournalEntry,
} from './journalEntry.controller.js';
import {
  createJournalEntryBodySchema,
  journalEntryIdParamSchema,
  listJournalEntriesQuerySchema,
  updateJournalEntryBodySchema,
} from './journalEntry.validator.js';

const router = Router();

router.post(
  '/',
  authorize('JOURNAL_ENTRY', 'CREATE'),
  validate(createJournalEntryBodySchema, 'body'),
  createJournalEntry,
);
router.get(
  '/',
  authorize('JOURNAL_ENTRY', 'READ'),
  validate(listJournalEntriesQuerySchema, 'query'),
  listJournalEntries,
);
router.get(
  '/:id',
  authorize('JOURNAL_ENTRY', 'READ'),
  validate(journalEntryIdParamSchema, 'params'),
  getJournalEntry,
);
router.put(
  '/:id',
  authorize('JOURNAL_ENTRY', 'UPDATE'),
  validate(journalEntryIdParamSchema, 'params'),
  validate(updateJournalEntryBodySchema, 'body'),
  updateJournalEntry,
);
router.delete(
  '/:id',
  authorize('JOURNAL_ENTRY', 'DELETE'),
  validate(journalEntryIdParamSchema, 'params'),
  deleteJournalEntry,
);
router.post(
  '/:id/post',
  authorize('JOURNAL_ENTRY', 'APPROVE'),
  validate(journalEntryIdParamSchema, 'params'),
  postJournalEntry,
);
router.post(
  '/:id/reverse',
  authorize('JOURNAL_ENTRY', 'APPROVE'),
  validate(journalEntryIdParamSchema, 'params'),
  reverseJournalEntry,
);

export default router;
