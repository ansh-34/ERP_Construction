-- CreateEnum
CREATE TYPE "AccountCategoryType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "NormalBalance" AS ENUM ('DEBIT', 'CREDIT');

-- CreateTable
CREATE TABLE "IndustryAccountCategory" (
    "id" UUID NOT NULL,
    "name" JSONB NOT NULL,
    "code" TEXT NOT NULL,
    "searchText" TEXT NOT NULL DEFAULT '',
    "categoryType" "AccountCategoryType" NOT NULL,
    "normalBalance" "NormalBalance" NOT NULL,
    "parentId" UUID,
    "path" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "childrenCount" INTEGER NOT NULL DEFAULT 0,
    "industryType" "IndustryEnum" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPostingAllowed" BOOLEAN NOT NULL DEFAULT false,
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndustryAccountCategory_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "IndustryAccountCategory_level_check" CHECK ("level" >= 0),
    CONSTRAINT "IndustryAccountCategory_children_count_check" CHECK ("childrenCount" >= 0),
    CONSTRAINT "IndustryAccountCategory_sort_order_check" CHECK ("sortOrder" >= 0)
);

-- CreateTable
CREATE TABLE "IndustryAccount" (
    "id" UUID NOT NULL,
    "name" JSONB NOT NULL,
    "code" TEXT NOT NULL,
    "searchText" TEXT NOT NULL DEFAULT '',
    "description" TEXT,
    "parentId" UUID,
    "path" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "childrenCount" INTEGER NOT NULL DEFAULT 0,
    "industryAccountCategoryId" UUID NOT NULL,
    "currencyId" UUID,
    "isCashOrBank" BOOLEAN NOT NULL DEFAULT false,
    "isPostingAllowed" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "industryType" "IndustryEnum" NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndustryAccount_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "IndustryAccount_level_check" CHECK ("level" >= 0),
    CONSTRAINT "IndustryAccount_children_count_check" CHECK ("childrenCount" >= 0),
    CONSTRAINT "IndustryAccount_sort_order_check" CHECK ("sortOrder" >= 0),
    CONSTRAINT "IndustryAccount_posting_leaf_check" CHECK ("isPostingAllowed" = false OR "childrenCount" = 0)
);

-- CreateIndex
CREATE UNIQUE INDEX "IndustryAccountCategory_industryType_code_isDeleted_key" ON "IndustryAccountCategory"("industryType", "code", "isDeleted");
CREATE INDEX "IndustryAccountCategory_industryType_status_isDeleted_idx" ON "IndustryAccountCategory"("industryType", "status", "isDeleted");
CREATE INDEX "IndustryAccountCategory_parentId_isDeleted_idx" ON "IndustryAccountCategory"("parentId", "isDeleted");
CREATE INDEX "IndustryAccountCategory_path_idx" ON "IndustryAccountCategory"("path");

-- CreateIndex
CREATE UNIQUE INDEX "IndustryAccount_industryType_code_isDeleted_key" ON "IndustryAccount"("industryType", "code", "isDeleted");
CREATE INDEX "IndustryAccount_industryType_status_isDeleted_idx" ON "IndustryAccount"("industryType", "status", "isDeleted");
CREATE INDEX "IndustryAccount_industryAccountCategoryId_isDeleted_idx" ON "IndustryAccount"("industryAccountCategoryId", "isDeleted");
CREATE INDEX "IndustryAccount_parentId_isDeleted_idx" ON "IndustryAccount"("parentId", "isDeleted");
CREATE INDEX "IndustryAccount_currencyId_idx" ON "IndustryAccount"("currencyId");
CREATE INDEX "IndustryAccount_path_idx" ON "IndustryAccount"("path");

-- AddForeignKey
ALTER TABLE "IndustryAccountCategory" ADD CONSTRAINT "IndustryAccountCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "IndustryAccountCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IndustryAccount" ADD CONSTRAINT "IndustryAccount_industryAccountCategoryId_fkey" FOREIGN KEY ("industryAccountCategoryId") REFERENCES "IndustryAccountCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IndustryAccount" ADD CONSTRAINT "IndustryAccount_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "IndustryAccount" ADD CONSTRAINT "IndustryAccount_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "IndustryAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
