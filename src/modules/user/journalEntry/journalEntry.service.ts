import { JournalEntryService } from '../../domain/journalEntry/journalEntry.service.js';

/**
 * User-facing journal service.
 *
 * Accounting rules and repository transactions stay centralized in the domain
 * service so Domain and User APIs cannot produce different ledger results.
 */
export const UserJournalEntryService = {
  create: JournalEntryService.create,
  list: JournalEntryService.list,
  getById: JournalEntryService.getById,
  update: JournalEntryService.update,
  delete: JournalEntryService.delete,
  post: JournalEntryService.post,
  reverse: JournalEntryService.reverse,
};
