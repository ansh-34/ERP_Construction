CREATE TABLE "AdminIndustryRoleTemplate" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" JSONB NOT NULL,
    "code" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 4,
    "industry" "IndustryEnum" NOT NULL,
    "searchText" TEXT NOT NULL DEFAULT '',
    "adminId" UUID NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminIndustryRoleTemplate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminIndustryRoleTemplate_adminId_industry_code_isDeleted_key" ON "AdminIndustryRoleTemplate"("adminId", "industry", "code", "isDeleted");
CREATE INDEX "AdminIndustryRoleTemplate_createdAt_isDeleted_idx" ON "AdminIndustryRoleTemplate"("createdAt", "isDeleted");
CREATE INDEX "AdminIndustryRoleTemplate_createdAt_isDeleted_status_idx" ON "AdminIndustryRoleTemplate"("createdAt", "isDeleted", "status");
CREATE INDEX "AdminIndustryRoleTemplate_adminId_industry_isDeleted_idx" ON "AdminIndustryRoleTemplate"("adminId", "industry", "isDeleted");

ALTER TABLE "AdminIndustryRoleTemplate" ADD CONSTRAINT "AdminIndustryRoleTemplate_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
