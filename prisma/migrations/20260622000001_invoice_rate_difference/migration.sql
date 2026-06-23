-- Final invoice: capture unit rate and auto rate difference vs proforma

ALTER TABLE "InvoiceItem" ADD COLUMN IF NOT EXISTS "rate" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "InvoiceItem" ADD COLUMN IF NOT EXISTS "rateDifference" DOUBLE PRECISION NOT NULL DEFAULT 0;
