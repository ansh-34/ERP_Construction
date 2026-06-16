CREATE TYPE "PdfStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

ALTER TABLE "Invoice" ADD COLUMN "pdfStatus" "PdfStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "Invoice" ADD COLUMN "pdfUrl" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "pdfGeneratedAt" TIMESTAMP(3);
ALTER TABLE "Invoice" ADD COLUMN "pdfVersion" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "InvoiceTemplate" (
  "id"          UUID NOT NULL,
  "name"        TEXT NOT NULL DEFAULT '',
  "htmlContent" TEXT NOT NULL,
  "domainId"    UUID NOT NULL,
  "status"      "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
  "isDeleted"   BOOLEAN NOT NULL DEFAULT false,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InvoiceTemplate_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "InvoiceTemplate_domainId_isDeleted_status_idx" ON "InvoiceTemplate"("domainId", "isDeleted", "status");

ALTER TABLE "InvoiceTemplate" ADD CONSTRAINT "InvoiceTemplate_domainId_fkey"
  FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
