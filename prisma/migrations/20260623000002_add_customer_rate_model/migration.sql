-- CreateTable
CREATE TABLE "CustomerRate" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "productGradeId" UUID NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "currencyId" UUID NOT NULL,
    "uomId" UUID NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "effectiveTo" DATE,
    "domainId" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerRate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CustomerRate_domainId_isDeleted_idx" ON "CustomerRate"("domainId", "isDeleted");
CREATE INDEX "CustomerRate_customerId_idx" ON "CustomerRate"("customerId");
CREATE INDEX "CustomerRate_productId_idx" ON "CustomerRate"("productId");
CREATE INDEX "CustomerRate_productGradeId_idx" ON "CustomerRate"("productGradeId");
CREATE INDEX "CustomerRate_adminId_idx" ON "CustomerRate"("adminId");

ALTER TABLE "CustomerRate" ADD CONSTRAINT "CustomerRate_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CustomerRate" ADD CONSTRAINT "CustomerRate_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CustomerRate" ADD CONSTRAINT "CustomerRate_productGradeId_fkey" FOREIGN KEY ("productGradeId") REFERENCES "ProductGrades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CustomerRate" ADD CONSTRAINT "CustomerRate_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CustomerRate" ADD CONSTRAINT "CustomerRate_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CustomerRate" ADD CONSTRAINT "CustomerRate_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomerRate" ADD CONSTRAINT "CustomerRate_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
