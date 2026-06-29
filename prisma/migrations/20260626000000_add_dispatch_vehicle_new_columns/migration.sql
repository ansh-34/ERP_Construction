-- AlterTable
ALTER TABLE "DispatchVehicle"
  ADD COLUMN "referenceNumber"    TEXT,
  ADD COLUMN "notes"              TEXT,
  ADD COLUMN "journeyScheduleCode" TEXT,
  ADD COLUMN "emptyVehicleWeight"  DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "loadedVehicleWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "vehicleWeightUomId"  UUID;

-- AddForeignKey
ALTER TABLE "DispatchVehicle" ADD CONSTRAINT "DispatchVehicle_vehicleWeightUomId_fkey"
  FOREIGN KEY ("vehicleWeightUomId") REFERENCES "Uom"("id") ON DELETE SET NULL ON UPDATE CASCADE;
