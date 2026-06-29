-- CreateTable
CREATE TABLE "CostCenter" (
    "id" UUID NOT NULL,
    "name" JSONB NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "parentId" UUID,
    "path" TEXT NOT NULL DEFAULT '',
    "level" INTEGER NOT NULL DEFAULT 0,
    "childrenCount" INTEGER NOT NULL DEFAULT 0,
    "industryIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "industryCategoryIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "costCenterId" UUID,
    "projectId" UUID,
    "domainId" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CostCenter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CostCenter_domainId_isDeleted_idx" ON "CostCenter"("domainId", "isDeleted");

-- CreateIndex
CREATE INDEX "CostCenter_adminId_idx" ON "CostCenter"("adminId");

-- CreateIndex
CREATE INDEX "CostCenter_parentId_idx" ON "CostCenter"("parentId");

-- CreateIndex
CREATE INDEX "CostCenter_costCenterId_idx" ON "CostCenter"("costCenterId");

-- CreateIndex
CREATE INDEX "CostCenter_projectId_idx" ON "CostCenter"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "CostCenter_code_domainId_isDeleted_key" ON "CostCenter"("code", "domainId", "isDeleted");

-- AddForeignKey
ALTER TABLE "CostCenter" ADD CONSTRAINT "CostCenter_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CostCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostCenter" ADD CONSTRAINT "CostCenter_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostCenter" ADD CONSTRAINT "CostCenter_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostCenter" ADD CONSTRAINT "CostCenter_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CostCenter" ADD CONSTRAINT "CostCenter_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
