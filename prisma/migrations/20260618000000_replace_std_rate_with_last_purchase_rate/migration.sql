-- Drop the manually-maintained standard rate table (leaf table, nothing references it)
DROP TABLE "ProductGradeStdRates";

-- New table: automatically-captured last vendor purchase price per product/grade/uom
CREATE TABLE "ProductGradeLastPurchaseRate" (
  "id"               UUID NOT NULL,
  "productId"        UUID NOT NULL,
  "productGradeId"   UUID NOT NULL,
  "uomId"            UUID NOT NULL,
  "lastPrice"        DOUBLE PRECISION NOT NULL,
  "currencyId"       UUID,
  "vendorId"         UUID,
  "vendorName"       TEXT NOT NULL,
  "lastInvoiceId"    UUID,
  "lastPurchaseDate" TIMESTAMP(3) NOT NULL,
  "searchText"       TEXT NOT NULL DEFAULT '',
  "domainId"         UUID NOT NULL,
  "status"           "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
  "isDeleted"        BOOLEAN NOT NULL DEFAULT false,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductGradeLastPurchaseRate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductGradeLastPurchaseRate_productId_productGradeId_uomId_domainId_key"
  ON "ProductGradeLastPurchaseRate"("productId", "productGradeId", "uomId", "domainId");
CREATE INDEX "ProductGradeLastPurchaseRate_isDeleted_idx"
  ON "ProductGradeLastPurchaseRate"("isDeleted");
CREATE INDEX "ProductGradeLastPurchaseRate_createdAt_isDeleted_domainId_idx"
  ON "ProductGradeLastPurchaseRate"("createdAt", "isDeleted", "domainId");
CREATE INDEX "ProductGradeLastPurchaseRate_createdAt_isDeleted_status_idx"
  ON "ProductGradeLastPurchaseRate"("createdAt", "isDeleted", "status");
CREATE INDEX "ProductGradeLastPurchaseRate_productId_idx"
  ON "ProductGradeLastPurchaseRate"("productId");
CREATE INDEX "ProductGradeLastPurchaseRate_productGradeId_idx"
  ON "ProductGradeLastPurchaseRate"("productGradeId");
CREATE INDEX "ProductGradeLastPurchaseRate_domainId_idx"
  ON "ProductGradeLastPurchaseRate"("domainId");

ALTER TABLE "ProductGradeLastPurchaseRate" ADD CONSTRAINT "ProductGradeLastPurchaseRate_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductGradeLastPurchaseRate" ADD CONSTRAINT "ProductGradeLastPurchaseRate_productGradeId_fkey"
  FOREIGN KEY ("productGradeId") REFERENCES "ProductGrades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductGradeLastPurchaseRate" ADD CONSTRAINT "ProductGradeLastPurchaseRate_uomId_fkey"
  FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductGradeLastPurchaseRate" ADD CONSTRAINT "ProductGradeLastPurchaseRate_currencyId_fkey"
  FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductGradeLastPurchaseRate" ADD CONSTRAINT "ProductGradeLastPurchaseRate_lastInvoiceId_fkey"
  FOREIGN KEY ("lastInvoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductGradeLastPurchaseRate" ADD CONSTRAINT "ProductGradeLastPurchaseRate_domainId_fkey"
  FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
