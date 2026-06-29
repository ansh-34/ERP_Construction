-- CreateIndex
CREATE INDEX "Account_costCenterId_idx" ON "Account"("costCenterId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
