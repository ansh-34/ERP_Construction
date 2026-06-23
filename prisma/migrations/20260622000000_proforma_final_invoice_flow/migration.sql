-- Proforma -> Final invoice flow with auto payment requests

-- Enums
CREATE TYPE "InvoiceType" AS ENUM ('PROFORMA', 'FINAL');
CREATE TYPE "RecordLifecycle" AS ENUM ('ACTIVE', 'VOID');

-- Invoice: type / lifecycle / supersession self-relation
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "invoiceType" "InvoiceType" NOT NULL DEFAULT 'PROFORMA';
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "lifecycle" "RecordLifecycle" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "supersededById" UUID;

CREATE INDEX IF NOT EXISTS "Invoice_supersededById_idx" ON "Invoice"("supersededById");

ALTER TABLE "Invoice"
  ADD CONSTRAINT "Invoice_supersededById_fkey"
  FOREIGN KEY ("supersededById") REFERENCES "Invoice"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- PaymentRequest: link to invoice + lifecycle
ALTER TABLE "PaymentRequest" ADD COLUMN IF NOT EXISTS "invoiceId" UUID;
ALTER TABLE "PaymentRequest" ADD COLUMN IF NOT EXISTS "lifecycle" "RecordLifecycle" NOT NULL DEFAULT 'ACTIVE';

CREATE INDEX IF NOT EXISTS "PaymentRequest_invoiceId_idx" ON "PaymentRequest"("invoiceId");

ALTER TABLE "PaymentRequest"
  ADD CONSTRAINT "PaymentRequest_invoiceId_fkey"
  FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
