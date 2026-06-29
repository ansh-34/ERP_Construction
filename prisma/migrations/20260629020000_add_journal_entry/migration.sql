-- CreateEnum
CREATE TYPE "JournalEntryStatus" AS ENUM ('DRAFT', 'POSTED', 'REVERSED');

-- CreateEnum
CREATE TYPE "JournalEntryType" AS ENUM ('AUTO', 'MANUAL');

-- CreateEnum
CREATE TYPE "JournalEntryLineStatus" AS ENUM ('ACTIVE', 'REVERSED');

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" UUID NOT NULL,
    "voucherNo" TEXT NOT NULL,
    "voucherType" TEXT NOT NULL,
    "transactionDate" DATE NOT NULL,
    "postingDate" DATE NOT NULL,
    "referenceNo" TEXT,
    "externalReferenceNo" TEXT,
    "narration" TEXT,
    "totalDebit" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "totalCredit" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "currencyId" UUID NOT NULL,
    "exchangeRate" DECIMAL(20,10) NOT NULL DEFAULT 1,
    "status" "JournalEntryStatus" NOT NULL DEFAULT 'DRAFT',
    "entryType" "JournalEntryType" NOT NULL,
    "sourceDocumentId" UUID,
    "sourceDocumentType" TEXT,
    "reversalJournalId" UUID,
    "reversalDate" DATE,
    "isAdjustment" BOOLEAN NOT NULL DEFAULT false,
    "isYearEndClosing" BOOLEAN NOT NULL DEFAULT false,
    "fiscalYearId" UUID NOT NULL,
    "accountingPeriodId" UUID NOT NULL,
    "vendorId" UUID,
    "customerId" UUID,
    "domainId" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "createdBy" UUID NOT NULL,
    "approvedBy" UUID,
    "approvedAt" TIMESTAMP(3),
    "postedBy" UUID,
    "postedAt" TIMESTAMP(3),
    "costCenterId" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "JournalEntry_amounts_check" CHECK ("totalDebit" >= 0 AND "totalCredit" >= 0),
    CONSTRAINT "JournalEntry_exchange_rate_check" CHECK ("exchangeRate" > 0)
);

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_voucherNo_domainId_fiscalYearId_isDeleted_key" ON "JournalEntry"("voucherNo", "domainId", "fiscalYearId", "isDeleted");
CREATE INDEX "JournalEntry_domainId_status_isDeleted_idx" ON "JournalEntry"("domainId", "status", "isDeleted");
CREATE INDEX "JournalEntry_fiscalYearId_accountingPeriodId_idx" ON "JournalEntry"("fiscalYearId", "accountingPeriodId");
CREATE INDEX "JournalEntry_transactionDate_idx" ON "JournalEntry"("transactionDate");
CREATE INDEX "JournalEntry_postingDate_idx" ON "JournalEntry"("postingDate");
CREATE INDEX "JournalEntry_currencyId_idx" ON "JournalEntry"("currencyId");
CREATE INDEX "JournalEntry_vendorId_idx" ON "JournalEntry"("vendorId");
CREATE INDEX "JournalEntry_customerId_idx" ON "JournalEntry"("customerId");
CREATE INDEX "JournalEntry_projectId_idx" ON "JournalEntry"("projectId");
CREATE INDEX "JournalEntry_costCenterId_idx" ON "JournalEntry"("costCenterId");
CREATE INDEX "JournalEntry_adminId_idx" ON "JournalEntry"("adminId");
CREATE INDEX "JournalEntry_createdBy_idx" ON "JournalEntry"("createdBy");

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_fiscalYearId_fkey" FOREIGN KEY ("fiscalYearId") REFERENCES "FiscalYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_accountingPeriodId_fkey" FOREIGN KEY ("accountingPeriodId") REFERENCES "AccountingPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_postedBy_fkey" FOREIGN KEY ("postedBy") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_reversalJournalId_fkey" FOREIGN KEY ("reversalJournalId") REFERENCES "JournalEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "JournalEntryLine" (
    "id" UUID NOT NULL,
    "journalEntryId" UUID NOT NULL,
    "lineNo" INTEGER NOT NULL,
    "accountId" UUID NOT NULL,
    "debitAmount" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "creditAmount" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "transactionCurrencyDebit" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "transactionCurrencyCredit" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "exchangeRate" DECIMAL(20,10) NOT NULL DEFAULT 1,
    "description" TEXT,
    "referenceNo" TEXT,
    "costCenterId" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "reconciledAmount" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "isReconciled" BOOLEAN NOT NULL DEFAULT false,
    "status" "JournalEntryLineStatus" NOT NULL DEFAULT 'ACTIVE',
    "vendorId" UUID,
    "customerId" UUID,
    "adminId" UUID NOT NULL,
    "domainId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntryLine_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "JournalEntryLine_amounts_check" CHECK (
        "debitAmount" >= 0
        AND "creditAmount" >= 0
        AND "transactionCurrencyDebit" >= 0
        AND "transactionCurrencyCredit" >= 0
        AND "reconciledAmount" >= 0
    ),
    CONSTRAINT "JournalEntryLine_debit_or_credit_check" CHECK (
        ("debitAmount" > 0 AND "creditAmount" = 0)
        OR ("creditAmount" > 0 AND "debitAmount" = 0)
    ),
    CONSTRAINT "JournalEntryLine_exchange_rate_check" CHECK ("exchangeRate" > 0)
);

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntryLine_journalEntryId_lineNo_key" ON "JournalEntryLine"("journalEntryId", "lineNo");
CREATE INDEX "JournalEntryLine_accountId_idx" ON "JournalEntryLine"("accountId");
CREATE INDEX "JournalEntryLine_costCenterId_idx" ON "JournalEntryLine"("costCenterId");
CREATE INDEX "JournalEntryLine_projectId_idx" ON "JournalEntryLine"("projectId");
CREATE INDEX "JournalEntryLine_vendorId_idx" ON "JournalEntryLine"("vendorId");
CREATE INDEX "JournalEntryLine_customerId_idx" ON "JournalEntryLine"("customerId");
CREATE INDEX "JournalEntryLine_adminId_idx" ON "JournalEntryLine"("adminId");
CREATE INDEX "JournalEntryLine_domainId_status_idx" ON "JournalEntryLine"("domainId", "status");

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
