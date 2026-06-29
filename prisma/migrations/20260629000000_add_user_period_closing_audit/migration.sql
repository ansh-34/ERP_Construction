-- AlterTable
ALTER TABLE "FiscalYear" ADD COLUMN "closedByUserId" UUID;
ALTER TABLE "AccountingPeriod" ADD COLUMN "closedByUserId" UUID;

-- Replace closure consistency checks so exactly one actor type closes a record.
ALTER TABLE "FiscalYear" DROP CONSTRAINT "FiscalYear_closure_check";
ALTER TABLE "FiscalYear" ADD CONSTRAINT "FiscalYear_closure_check" CHECK (
    ("isClosed" = false AND "closedAt" IS NULL AND "closedBy" IS NULL AND "closedByUserId" IS NULL)
    OR
    ("isClosed" = true AND "closedAt" IS NOT NULL AND (
        ("closedBy" IS NOT NULL AND "closedByUserId" IS NULL)
        OR
        ("closedBy" IS NULL AND "closedByUserId" IS NOT NULL)
    ))
);

ALTER TABLE "AccountingPeriod" DROP CONSTRAINT "AccountingPeriod_closure_check";
ALTER TABLE "AccountingPeriod" ADD CONSTRAINT "AccountingPeriod_closure_check" CHECK (
    ("isClosed" = false AND "closedAt" IS NULL AND "closedBy" IS NULL AND "closedByUserId" IS NULL)
    OR
    ("isClosed" = true AND "closedAt" IS NOT NULL AND (
        ("closedBy" IS NOT NULL AND "closedByUserId" IS NULL)
        OR
        ("closedBy" IS NULL AND "closedByUserId" IS NOT NULL)
    ))
);

-- CreateIndex
CREATE INDEX "FiscalYear_closedByUserId_idx" ON "FiscalYear"("closedByUserId");
CREATE INDEX "AccountingPeriod_closedByUserId_idx" ON "AccountingPeriod"("closedByUserId");

-- AddForeignKey
ALTER TABLE "FiscalYear" ADD CONSTRAINT "FiscalYear_closedByUserId_fkey" FOREIGN KEY ("closedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AccountingPeriod" ADD CONSTRAINT "AccountingPeriod_closedByUserId_fkey" FOREIGN KEY ("closedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
