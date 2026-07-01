-- CreateTable
CREATE TABLE "GeneralLedgerEntry" (
    "id" UUID NOT NULL,
    "journalEntryId" UUID NOT NULL,
    "journalEntryLineId" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "transactionDate" DATE NOT NULL,
    "postingDate" DATE NOT NULL,
    "fiscalYearId" UUID NOT NULL,
    "accountingPeriodId" UUID NOT NULL,
    "debitAmount" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "creditAmount" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "runningBalance" DECIMAL(20,6),
    "costCenterId" UUID,
    "projectId" UUID,
    "sourceDocumentId" TEXT,
    "sourceDocumentType" TEXT,
    "adminId" UUID NOT NULL,
    "domainId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneralLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountBalance" (
    "id" UUID NOT NULL,
    "accountId" UUID NOT NULL,
    "fiscalYearId" UUID NOT NULL,
    "accountingPeriodId" UUID NOT NULL,
    "costCenterId" UUID,
    "projectId" UUID,
    "openingDebit" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "openingCredit" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "periodDebit" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "periodCredit" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "closingDebit" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "closingCredit" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "lastJournalEntryId" UUID,
    "adminId" UUID NOT NULL,
    "domainId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GeneralLedgerEntry_accountId_postingDate_idx" ON "GeneralLedgerEntry"("accountId", "postingDate");

-- CreateIndex
CREATE INDEX "GeneralLedgerEntry_journalEntryId_idx" ON "GeneralLedgerEntry"("journalEntryId");

-- CreateIndex
CREATE INDEX "GeneralLedgerEntry_journalEntryLineId_idx" ON "GeneralLedgerEntry"("journalEntryLineId");

-- CreateIndex
CREATE INDEX "GeneralLedgerEntry_fiscalYearId_idx" ON "GeneralLedgerEntry"("fiscalYearId");

-- CreateIndex
CREATE INDEX "GeneralLedgerEntry_accountingPeriodId_idx" ON "GeneralLedgerEntry"("accountingPeriodId");

-- CreateIndex
CREATE INDEX "GeneralLedgerEntry_domainId_idx" ON "GeneralLedgerEntry"("domainId");

-- CreateIndex
CREATE INDEX "GeneralLedgerEntry_adminId_idx" ON "GeneralLedgerEntry"("adminId");

-- CreateIndex
CREATE INDEX "GeneralLedgerEntry_costCenterId_idx" ON "GeneralLedgerEntry"("costCenterId");

-- CreateIndex
CREATE INDEX "GeneralLedgerEntry_projectId_idx" ON "GeneralLedgerEntry"("projectId");

-- CreateIndex
CREATE INDEX "AccountBalance_domainId_idx" ON "AccountBalance"("domainId");

-- CreateIndex
CREATE INDEX "AccountBalance_adminId_idx" ON "AccountBalance"("adminId");

-- CreateIndex
CREATE INDEX "AccountBalance_accountingPeriodId_idx" ON "AccountBalance"("accountingPeriodId");

-- CreateIndex
CREATE INDEX "AccountBalance_fiscalYearId_idx" ON "AccountBalance"("fiscalYearId");

-- CreateIndex
CREATE INDEX "AccountBalance_costCenterId_idx" ON "AccountBalance"("costCenterId");

-- CreateIndex
CREATE INDEX "AccountBalance_projectId_idx" ON "AccountBalance"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountBalance_accountId_fiscalYearId_accountingPeriodId_cos_key" ON "AccountBalance"("accountId", "fiscalYearId", "accountingPeriodId", "costCenterId", "projectId", "domainId");

-- AddForeignKey
ALTER TABLE "GeneralLedgerEntry" ADD CONSTRAINT "GeneralLedgerEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneralLedgerEntry" ADD CONSTRAINT "GeneralLedgerEntry_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneralLedgerEntry" ADD CONSTRAINT "GeneralLedgerEntry_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountBalance" ADD CONSTRAINT "AccountBalance_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountBalance" ADD CONSTRAINT "AccountBalance_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountBalance" ADD CONSTRAINT "AccountBalance_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
