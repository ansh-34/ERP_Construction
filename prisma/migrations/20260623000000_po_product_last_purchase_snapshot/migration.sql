-- Add last-purchase snapshot fields to PurchaseOrderProduct.
-- All nullable so existing rows are unaffected.

ALTER TABLE "PurchaseOrderProduct"
  ADD COLUMN IF NOT EXISTS "lastPurchasePrice"      DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "lastPurchaseCurrencyId" UUID,
  ADD COLUMN IF NOT EXISTS "lastPurchaseVendorId"   UUID,
  ADD COLUMN IF NOT EXISTS "lastPurchaseVendorName" TEXT;
