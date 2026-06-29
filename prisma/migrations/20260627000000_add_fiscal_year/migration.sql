-- CreateTable
CREATE TABLE "FiscalYear" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "closedAt" TIMESTAMP(3),
    "closedBy" UUID,
    "adminId" UUID NOT NULL,
    "domainId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FiscalYear_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "FiscalYear_date_range_check" CHECK ("startDate" < "endDate"),
    CONSTRAINT "FiscalYear_closure_check" CHECK (
        ("isClosed" = false AND "closedAt" IS NULL AND "closedBy" IS NULL)
        OR
        ("isClosed" = true AND "closedAt" IS NOT NULL AND "closedBy" IS NOT NULL)
    )
);

-- CreateIndex
CREATE UNIQUE INDEX "FiscalYear_name_domainId_key" ON "FiscalYear"("name", "domainId");

-- CreateIndex
CREATE INDEX "FiscalYear_domainId_isClosed_idx" ON "FiscalYear"("domainId", "isClosed");

-- CreateIndex
CREATE INDEX "FiscalYear_adminId_idx" ON "FiscalYear"("adminId");

-- CreateIndex
CREATE INDEX "FiscalYear_closedBy_idx" ON "FiscalYear"("closedBy");

-- AddForeignKey
ALTER TABLE "FiscalYear" ADD CONSTRAINT "FiscalYear_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalYear" ADD CONSTRAINT "FiscalYear_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiscalYear" ADD CONSTRAINT "FiscalYear_closedBy_fkey" FOREIGN KEY ("closedBy") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
