-- referenceNumber is a generic reference (invoice, GRN, etc.); make it optional.
-- The structured invoice link is PaymentRequest.invoiceId.
ALTER TABLE "PaymentRequest" ALTER COLUMN "referenceNumber" DROP NOT NULL;
