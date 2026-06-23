-- Drop the invoice supersession self-relation
ALTER TABLE "Invoice" DROP CONSTRAINT IF EXISTS "Invoice_supersededById_fkey";
DROP INDEX IF EXISTS "Invoice_supersededById_idx";
ALTER TABLE "Invoice" DROP COLUMN IF EXISTS "supersededById";

-- Keep PaymentRequest.invoiceId as a plain reference column (no FK / relation),
-- so referenceNumber/invoiceId can loosely reference invoices or other docs.
ALTER TABLE "PaymentRequest" DROP CONSTRAINT IF EXISTS "PaymentRequest_invoiceId_fkey";
