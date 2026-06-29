-- CreateEnum
CREATE TYPE "AccountCategoryTypeEnum" AS ENUM ('ASSET', 'LIABILITY', 'REVENUE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "NormalBalanceEnum" AS ENUM ('DEBIT', 'CREDIT');

-- CreateTable
CREATE TABLE "AccountCategory" (
    "id" UUID NOT NULL,
    "name" JSONB NOT NULL,
    "code" TEXT NOT NULL,
    "searchText" TEXT NOT NULL DEFAULT '',
    "categoryType" "AccountCategoryTypeEnum" NOT NULL,
    "normalBalance" "NormalBalanceEnum" NOT NULL,
    "parentId" UUID,
    "path" TEXT NOT NULL DEFAULT '',
    "level" INTEGER NOT NULL DEFAULT 0,
    "childrenCount" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPostingAllowed" BOOLEAN NOT NULL DEFAULT false,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "domainId" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" UUID NOT NULL,
    "name" JSONB NOT NULL,
    "code" TEXT NOT NULL,
    "searchText" TEXT NOT NULL DEFAULT '',
    "description" TEXT,
    "parentId" UUID,
    "path" TEXT NOT NULL DEFAULT '',
    "level" INTEGER NOT NULL DEFAULT 0,
    "childrenCount" INTEGER NOT NULL DEFAULT 0,
    "accountCategoryId" UUID NOT NULL,
    "currencyId" UUID,
    "isCashOrBank" BOOLEAN NOT NULL DEFAULT false,
    "isPostingAllowed" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "costCenterId" UUID,
    "projectId" UUID,
    "domainId" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountCategory_domainId_isDeleted_idx" ON "AccountCategory"("domainId", "isDeleted");

-- CreateIndex
CREATE INDEX "AccountCategory_adminId_idx" ON "AccountCategory"("adminId");

-- CreateIndex
CREATE INDEX "AccountCategory_parentId_idx" ON "AccountCategory"("parentId");

-- CreateIndex
CREATE INDEX "AccountCategory_categoryType_idx" ON "AccountCategory"("categoryType");

-- CreateIndex
CREATE UNIQUE INDEX "AccountCategory_code_domainId_isDeleted_key" ON "AccountCategory"("code", "domainId", "isDeleted");

-- CreateIndex
CREATE INDEX "Account_domainId_isDeleted_idx" ON "Account"("domainId", "isDeleted");

-- CreateIndex
CREATE INDEX "Account_adminId_idx" ON "Account"("adminId");

-- CreateIndex
CREATE INDEX "Account_parentId_idx" ON "Account"("parentId");

-- CreateIndex
CREATE INDEX "Account_accountCategoryId_idx" ON "Account"("accountCategoryId");

-- CreateIndex
CREATE INDEX "Account_projectId_idx" ON "Account"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_code_domainId_isDeleted_key" ON "Account"("code", "domainId", "isDeleted");

-- AddForeignKey
ALTER TABLE "AccountCategory" ADD CONSTRAINT "AccountCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AccountCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountCategory" ADD CONSTRAINT "AccountCategory_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountCategory" ADD CONSTRAINT "AccountCategory_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_accountCategoryId_fkey" FOREIGN KEY ("accountCategoryId") REFERENCES "AccountCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
