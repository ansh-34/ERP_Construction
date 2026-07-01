import { Router } from 'express';
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
  validate(createJournalEntryBodySchema, 'body'),
  createJournalEntry,
);
router.get(
  '/',
  validate(listJournalEntriesQuerySchema, 'query'),
  listJournalEntries,
);
router.get(
  '/:id',
  validate(journalEntryIdParamSchema, 'params'),
  getJournalEntry,
);
router.put(
  '/:id',
  validate(journalEntryIdParamSchema, 'params'),
  validate(updateJournalEntryBodySchema, 'body'),
  updateJournalEntry,
);
router.delete(
  '/:id',
  validate(journalEntryIdParamSchema, 'params'),
  deleteJournalEntry,
);
router.post(
  '/:id/post',
  validate(journalEntryIdParamSchema, 'params'),
  postJournalEntry,
);
router.post(
  '/:id/reverse',
  validate(journalEntryIdParamSchema, 'params'),
  reverseJournalEntry,
);

export default router;
