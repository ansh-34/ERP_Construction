CREATE TYPE "FuelTransactionType" AS ENUM ('REFILL', 'CONSUMED');
CREATE TYPE "FuelEntityType" AS ENUM ('PROJECT_FUEL_TANK', 'VEHICLE', 'MACHINERY');

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE "InventoryFuelStock" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL,
  "fuelType" "FuelType" NOT NULL,
  "uomId" UUID NOT NULL,
  "availableQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalRefilledQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "totalConsumedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "domainId" UUID NOT NULL,
  "adminId" UUID NOT NULL,
  "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "InventoryFuelStock_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "FuelLog"
ADD COLUMN "transactionType" "FuelTransactionType" NOT NULL DEFAULT 'REFILL',
ADD COLUMN "fuelEntityType" "FuelEntityType" NOT NULL DEFAULT 'PROJECT_FUEL_TANK',
ADD COLUMN "inventoryFuelStockId" UUID,
ADD COLUMN "vehicleId" UUID,
ADD COLUMN "machineryId" UUID;

CREATE UNIQUE INDEX "InventoryFuelStock_projectId_fuelType_uomId_domainId_isDeleted_key"
ON "InventoryFuelStock"("projectId", "fuelType", "uomId", "domainId", "isDeleted");

CREATE INDEX "InventoryFuelStock_createdAt_isDeleted_domainId_idx"
ON "InventoryFuelStock"("createdAt", "isDeleted", "domainId");

CREATE INDEX "InventoryFuelStock_createdAt_isDeleted_domainId_projectId_idx"
ON "InventoryFuelStock"("createdAt", "isDeleted", "domainId", "projectId");

CREATE INDEX "InventoryFuelStock_createdAt_isDeleted_domainId_fuelType_idx"
ON "InventoryFuelStock"("createdAt", "isDeleted", "domainId", "fuelType");

CREATE INDEX "InventoryFuelStock_adminId_idx"
ON "InventoryFuelStock"("adminId");

CREATE INDEX "FuelLog_transactionType_idx" ON "FuelLog"("transactionType");
CREATE INDEX "FuelLog_fuelEntityType_idx" ON "FuelLog"("fuelEntityType");
CREATE INDEX "FuelLog_inventoryFuelStockId_idx" ON "FuelLog"("inventoryFuelStockId");
CREATE INDEX "FuelLog_vehicleId_idx" ON "FuelLog"("vehicleId");
CREATE INDEX "FuelLog_machineryId_idx" ON "FuelLog"("machineryId");

ALTER TABLE "InventoryFuelStock"
ADD CONSTRAINT "InventoryFuelStock_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InventoryFuelStock"
ADD CONSTRAINT "InventoryFuelStock_uomId_fkey"
FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InventoryFuelStock"
ADD CONSTRAINT "InventoryFuelStock_domainId_fkey"
FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "InventoryFuelStock"
ADD CONSTRAINT "InventoryFuelStock_adminId_fkey"
FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "FuelLog"
ADD CONSTRAINT "FuelLog_inventoryFuelStockId_fkey"
FOREIGN KEY ("inventoryFuelStockId") REFERENCES "InventoryFuelStock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FuelLog"
ADD CONSTRAINT "FuelLog_vehicleId_fkey"
FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FuelLog"
ADD CONSTRAINT "FuelLog_machineryId_fkey"
FOREIGN KEY ("machineryId") REFERENCES "Machinery"("id") ON DELETE SET NULL ON UPDATE CASCADE;
