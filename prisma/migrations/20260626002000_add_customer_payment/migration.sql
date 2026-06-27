-- CreateEnum
CREATE TYPE "CustomerPaymentType" AS ENUM ('CASH');

-- CreateTable
CREATE TABLE "CustomerPayment" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "paidDate" DATE NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "outstandingAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roundOffAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paymentType" "CustomerPaymentType" NOT NULL DEFAULT 'CASH',
    "cashLedgerId" UUID,
    "remarks" TEXT,
    "searchText" TEXT NOT NULL DEFAULT '',
    "createdBy" UUID,
    "domainId" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerPayment_domainId_isDeleted_idx" ON "CustomerPayment"("domainId", "isDeleted");

-- CreateIndex
CREATE INDEX "CustomerPayment_customerId_idx" ON "CustomerPayment"("customerId");

-- CreateIndex
CREATE INDEX "CustomerPayment_paidDate_idx" ON "CustomerPayment"("paidDate");

-- CreateIndex
CREATE INDEX "CustomerPayment_adminId_idx" ON "CustomerPayment"("adminId");

-- CreateIndex
CREATE INDEX "CustomerPayment_createdBy_idx" ON "CustomerPayment"("createdBy");

-- AddForeignKey
ALTER TABLE "CustomerPayment" ADD CONSTRAINT "CustomerPayment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPayment" ADD CONSTRAINT "CustomerPayment_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPayment" ADD CONSTRAINT "CustomerPayment_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
