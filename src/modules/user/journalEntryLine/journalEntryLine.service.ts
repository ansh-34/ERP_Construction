import { JournalEntryLineService } from '../../domain/journalEntryLine/journalEntryLine.service.js';

/**
 * User-facing journal-line service.
 *
 * The domain service owns the shared accounting rules and repository access.
 */
export const UserJournalEntryLineService = {
  create: JournalEntryLineService.create,
  list: JournalEntryLineService.list,
  getById: JournalEntryLineService.getById,
  update: JournalEntryLineService.update,
  delete: JournalEntryLineService.delete,
};
