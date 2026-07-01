ALTER TABLE "GeneralLedgerEntry" ADD CONSTRAINT "GeneralLedgerEntry_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GeneralLedgerEntry" ADD CONSTRAINT "GeneralLedgerEntry_journalEntryLineId_fkey" FOREIGN KEY ("journalEntryLineId") REFERENCES "JournalEntryLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GeneralLedgerEntry" ADD CONSTRAINT "GeneralLedgerEntry_fiscalYearId_fkey" FOREIGN KEY ("fiscalYearId") REFERENCES "FiscalYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GeneralLedgerEntry" ADD CONSTRAINT "GeneralLedgerEntry_accountingPeriodId_fkey" FOREIGN KEY ("accountingPeriodId") REFERENCES "AccountingPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GeneralLedgerEntry" ADD CONSTRAINT "GeneralLedgerEntry_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GeneralLedgerEntry" ADD CONSTRAINT "GeneralLedgerEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
