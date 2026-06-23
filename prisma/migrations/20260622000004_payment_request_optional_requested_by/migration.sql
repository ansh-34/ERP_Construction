-- requestedBy is an FK to User, but invoice generation / payment requests can be
-- triggered by a domain owner whose token id is the domain (not a User). Allow null.
ALTER TABLE "PaymentRequest" ALTER COLUMN "requestedBy" DROP NOT NULL;
