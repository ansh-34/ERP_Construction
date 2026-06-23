-- Make invoiceId optional on Grn and GrnProduct
ALTER TABLE "Grn" ALTER COLUMN "invoiceId" DROP NOT NULL;
ALTER TABLE "GrnProduct" ALTER COLUMN "invoiceId" DROP NOT NULL;

-- Make vendorId optional on Grn (FK to VendorProductPricing)
ALTER TABLE "Grn" ALTER COLUMN "vendorId" DROP NOT NULL;

-- Make productOrderCode optional on Grn
ALTER TABLE "Grn" ALTER COLUMN "productOrderCode" DROP NOT NULL;

-- Add GrnReferenceType enum and referenceType column
CREATE TYPE "GrnReferenceType" AS ENUM ('INVOICE', 'PO', 'NA');
ALTER TABLE "Grn" ADD COLUMN IF NOT EXISTS "referenceType" "GrnReferenceType" NOT NULL DEFAULT 'NA';
