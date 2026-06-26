-- CreateEnum
CREATE TYPE "MachineryInventoryTransactionType" AS ENUM ('INWARD', 'OUTWARD');

-- CreateTable
CREATE TABLE "MachineryInventory" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "searchText" TEXT NOT NULL DEFAULT '',
    "machineId" UUID NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "restockLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "uomId" UUID NOT NULL,
    "domainId" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MachineryInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MachineryInventoryLog" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "transactionType" "MachineryInventoryTransactionType" NOT NULL,
    "name" TEXT NOT NULL,
    "searchText" TEXT NOT NULL DEFAULT '',
    "notes" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "machineryInventoryId" UUID NOT NULL,
    "machineId" UUID NOT NULL,
    "uomId" UUID NOT NULL,
    "domainId" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MachineryInventoryLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MachineryInventory_name_machineId_domainId_isDeleted_key" ON "MachineryInventory"("name", "machineId", "domainId", "isDeleted");

-- CreateIndex
CREATE INDEX "MachineryInventory_createdAt_isDeleted_domainId_idx" ON "MachineryInventory"("createdAt", "isDeleted", "domainId");

-- CreateIndex
CREATE INDEX "MachineryInventory_domainId_machineId_idx" ON "MachineryInventory"("domainId", "machineId");

-- CreateIndex
CREATE INDEX "MachineryInventory_domainId_uomId_idx" ON "MachineryInventory"("domainId", "uomId");

-- CreateIndex
CREATE INDEX "MachineryInventory_adminId_idx" ON "MachineryInventory"("adminId");

-- CreateIndex
CREATE INDEX "MachineryInventoryLog_createdAt_isDeleted_domainId_idx" ON "MachineryInventoryLog"("createdAt", "isDeleted", "domainId");

-- CreateIndex
CREATE INDEX "MachineryInventoryLog_domainId_transactionType_idx" ON "MachineryInventoryLog"("domainId", "transactionType");

-- CreateIndex
CREATE INDEX "MachineryInventoryLog_domainId_machineryInventoryId_idx" ON "MachineryInventoryLog"("domainId", "machineryInventoryId");

-- CreateIndex
CREATE INDEX "MachineryInventoryLog_domainId_machineId_idx" ON "MachineryInventoryLog"("domainId", "machineId");

-- CreateIndex
CREATE INDEX "MachineryInventoryLog_date_idx" ON "MachineryInventoryLog"("date");

-- CreateIndex
CREATE INDEX "MachineryInventoryLog_adminId_idx" ON "MachineryInventoryLog"("adminId");

-- AddForeignKey
ALTER TABLE "MachineryInventory" ADD CONSTRAINT "MachineryInventory_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machinery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineryInventory" ADD CONSTRAINT "MachineryInventory_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineryInventory" ADD CONSTRAINT "MachineryInventory_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineryInventory" ADD CONSTRAINT "MachineryInventory_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineryInventoryLog" ADD CONSTRAINT "MachineryInventoryLog_machineryInventoryId_fkey" FOREIGN KEY ("machineryInventoryId") REFERENCES "MachineryInventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineryInventoryLog" ADD CONSTRAINT "MachineryInventoryLog_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machinery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineryInventoryLog" ADD CONSTRAINT "MachineryInventoryLog_uomId_fkey" FOREIGN KEY ("uomId") REFERENCES "Uom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineryInventoryLog" ADD CONSTRAINT "MachineryInventoryLog_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MachineryInventoryLog" ADD CONSTRAINT "MachineryInventoryLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
