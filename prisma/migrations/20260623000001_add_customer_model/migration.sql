-- CreateEnum
CREATE TYPE "PaymentTermsEnum" AS ENUM ('CASH', 'CREDIT');

-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "phoneCode" TEXT,
    "phone" TEXT,
    "paymentTerms" "PaymentTermsEnum" NOT NULL DEFAULT 'CASH',
    "gstNumber" TEXT,
    "billingName" TEXT,
    "billingAddress" TEXT,
    "shippingAddress" TEXT,
    "searchText" TEXT NOT NULL DEFAULT '',
    "locationId" UUID,
    "domainId" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Customer_domainId_isDeleted_idx" ON "Customer"("domainId", "isDeleted");
CREATE INDEX "Customer_adminId_idx" ON "Customer"("adminId");
CREATE INDEX "Customer_locationId_idx" ON "Customer"("locationId");

ALTER TABLE "Customer" ADD CONSTRAINT "Customer_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
