CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE "InventoryFuelStock"
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
