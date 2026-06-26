-- CreateTable
CREATE TABLE "SystemUserType" (
    "id" UUID NOT NULL,
    "name" JSONB NOT NULL,
    "code" TEXT NOT NULL,
    "searchText" TEXT NOT NULL DEFAULT '',
    "description" JSONB,
    "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemUserType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUserType" (
    "id" UUID NOT NULL,
    "name" JSONB NOT NULL,
    "code" TEXT NOT NULL,
    "searchText" TEXT NOT NULL DEFAULT '',
    "description" JSONB,
    "adminId" UUID NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUserType_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Role" ADD COLUMN "userTypeId" UUID;
ALTER TABLE "Role" ADD COLUMN "userTypeCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SystemUserType_code_isDeleted_key" ON "SystemUserType"("code", "isDeleted");
CREATE INDEX "SystemUserType_createdAt_isDeleted_idx" ON "SystemUserType"("createdAt", "isDeleted");
CREATE INDEX "SystemUserType_createdAt_isDeleted_status_idx" ON "SystemUserType"("createdAt", "isDeleted", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUserType_adminId_code_isDeleted_key" ON "AdminUserType"("adminId", "code", "isDeleted");
CREATE INDEX "AdminUserType_createdAt_isDeleted_idx" ON "AdminUserType"("createdAt", "isDeleted");
CREATE INDEX "AdminUserType_createdAt_isDeleted_status_idx" ON "AdminUserType"("createdAt", "isDeleted", "status");
CREATE INDEX "AdminUserType_adminId_status_isDeleted_idx" ON "AdminUserType"("adminId", "status", "isDeleted");

-- CreateIndex
CREATE INDEX "Role_domainId_userTypeCode_idx" ON "Role"("domainId", "userTypeCode");
CREATE INDEX "Role_userTypeId_idx" ON "Role"("userTypeId");

-- AddForeignKey
ALTER TABLE "AdminUserType" ADD CONSTRAINT "AdminUserType_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_userTypeId_fkey" FOREIGN KEY ("userTypeId") REFERENCES "AdminUserType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
