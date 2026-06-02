ALTER TABLE "MachineReading"
ADD COLUMN "machineryId" UUID;

CREATE INDEX "MachineReading_machineryId_idx"
ON "MachineReading"("machineryId");

ALTER TABLE "MachineReading"
ADD CONSTRAINT "MachineReading_machineryId_fkey"
FOREIGN KEY ("machineryId") REFERENCES "Machinery"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
