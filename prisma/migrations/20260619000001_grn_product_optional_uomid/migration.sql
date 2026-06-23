-- Make uomId optional on GrnProduct (fallback to invoice data during GRN create)
ALTER TABLE "GrnProduct" ALTER COLUMN "uomId" DROP NOT NULL;
