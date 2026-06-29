-- CreateTable
CREATE TABLE "AccountingPeriod" (
    "id" UUID NOT NULL,
    "fiscalYearId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "periodNo" INTEGER NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "closedAt" TIMESTAMP(3),
    "closedBy" UUID,
    "domainId" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountingPeriod_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AccountingPeriod_number_check" CHECK ("periodNo" BETWEEN 1 AND 12),
    CONSTRAINT "AccountingPeriod_date_range_check" CHECK ("startDate" < "endDate"),
    CONSTRAINT "AccountingPeriod_closure_check" CHECK (
        ("isClosed" = false AND "closedAt" IS NULL AND "closedBy" IS NULL)
        OR
        ("isClosed" = true AND "closedAt" IS NOT NULL AND "closedBy" IS NOT NULL)
    )
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountingPeriod_fiscalYearId_periodNo_key" ON "AccountingPeriod"("fiscalYearId", "periodNo");

-- CreateIndex
CREATE UNIQUE INDEX "AccountingPeriod_fiscalYearId_name_key" ON "AccountingPeriod"("fiscalYearId", "name");

-- CreateIndex
CREATE INDEX "AccountingPeriod_domainId_isClosed_idx" ON "AccountingPeriod"("domainId", "isClosed");

-- CreateIndex
CREATE INDEX "AccountingPeriod_adminId_idx" ON "AccountingPeriod"("adminId");

-- CreateIndex
CREATE INDEX "AccountingPeriod_closedBy_idx" ON "AccountingPeriod"("closedBy");

-- AddForeignKey
ALTER TABLE "AccountingPeriod" ADD CONSTRAINT "AccountingPeriod_fiscalYearId_fkey" FOREIGN KEY ("fiscalYearId") REFERENCES "FiscalYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingPeriod" ADD CONSTRAINT "AccountingPeriod_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingPeriod" ADD CONSTRAINT "AccountingPeriod_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountingPeriod" ADD CONSTRAINT "AccountingPeriod_closedBy_fkey" FOREIGN KEY ("closedBy") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
