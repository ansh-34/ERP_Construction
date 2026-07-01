DROP INDEX "AccountBalance_accountId_fiscalYearId_accountingPeriodId_cos_key";

CREATE UNIQUE INDEX "AccountBalance_balance_key"
ON "AccountBalance"("domainId", "fiscalYearId", "accountingPeriodId", "accountId", "costCenterId");
