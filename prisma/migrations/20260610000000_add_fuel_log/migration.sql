CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL');
CREATE TYPE "FuelDirectionType" AS ENUM ('CONSUMED', 'FILLED');

CREATE TABLE "FuelLog" (
  "id"                UUID NOT NULL,
  "fuelType"          "FuelType" NOT NULL,
  "equipmentUniqueId" TEXT NOT NULL,
  "equipmentCategory" "MaintenanceAssetType" NOT NULL,
  "equipmentType"     TEXT NOT NULL,
  "date"              TIMESTAMP(3) NOT NULL,
  "fuelDirectionType" "FuelDirectionType" NOT NULL,
  "fuelValue"         DOUBLE PRECISION NOT NULL,
  "fuelQuantity"      DOUBLE PRECISION NOT NULL,
  "searchText"        TEXT NOT NULL DEFAULT '',
  "fuelUomId"         UUID NOT NULL,
  "projectId"         UUID,
  "domainId"          UUID NOT NULL,
  "adminId"           UUID NOT NULL,
  "status"            "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
  "isDeleted"         BOOLEAN NOT NULL DEFAULT false,
  "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FuelLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FuelLog_createdAt_isDeleted_domainId_idx" ON "FuelLog"("createdAt", "isDeleted", "domainId");
CREATE INDEX "FuelLog_domainId_equipmentCategory_idx" ON "FuelLog"("domainId", "equipmentCategory");
CREATE INDEX "FuelLog_fuelType_idx" ON "FuelLog"("fuelType");
CREATE INDEX "FuelLog_fuelDirectionType_idx" ON "FuelLog"("fuelDirectionType");
CREATE INDEX "FuelLog_projectId_idx" ON "FuelLog"("projectId");
CREATE INDEX "FuelLog_date_idx" ON "FuelLog"("date");

ALTER TABLE "FuelLog" ADD CONSTRAINT "FuelLog_fuelUomId_fkey"
  FOREIGN KEY ("fuelUomId") REFERENCES "Uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FuelLog" ADD CONSTRAINT "FuelLog_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FuelLog" ADD CONSTRAINT "FuelLog_domainId_fkey"
  FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FuelLog" ADD CONSTRAINT "FuelLog_adminId_fkey"
  FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
