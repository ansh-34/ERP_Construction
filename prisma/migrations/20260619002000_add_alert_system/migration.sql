CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'DISMISSED');
CREATE TYPE "NotificationRecipientType" AS ENUM ('DOMAIN', 'ADMIN', 'USER');

CREATE TABLE "AlertRule" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "moduleCode" TEXT NOT NULL,
  "alertCode" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "config" JSONB,
  "severity" "AlertSeverity" NOT NULL DEFAULT 'WARNING',
  "isEnabled" BOOLEAN NOT NULL DEFAULT true,
  "domainId" UUID NOT NULL,
  "adminId" UUID NOT NULL,
  "status" "StatusEnum" NOT NULL DEFAULT 'ACTIVE',
  "isDeleted" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AlertRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Alert" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "moduleCode" TEXT NOT NULL,
  "alertCode" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "severity" "AlertSeverity" NOT NULL,
  "alertStatus" "AlertStatus" NOT NULL DEFAULT 'ACTIVE',
  "metadata" JSONB,
  "domainId" UUID NOT NULL,
  "adminId" UUID NOT NULL,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "alertId" UUID,
  "recipientType" "NotificationRecipientType" NOT NULL,
  "recipientId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "readAt" TIMESTAMP(3),
  "domainId" UUID NOT NULL,
  "adminId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AlertRule_moduleCode_alertCode_domainId_isDeleted_key"
ON "AlertRule"("moduleCode", "alertCode", "domainId", "isDeleted");

CREATE INDEX "AlertRule_domainId_moduleCode_idx" ON "AlertRule"("domainId", "moduleCode");
CREATE INDEX "AlertRule_adminId_idx" ON "AlertRule"("adminId");

CREATE INDEX "Alert_domainId_moduleCode_alertCode_idx" ON "Alert"("domainId", "moduleCode", "alertCode");
CREATE INDEX "Alert_entityType_entityId_idx" ON "Alert"("entityType", "entityId");
CREATE INDEX "Alert_alertStatus_idx" ON "Alert"("alertStatus");
CREATE INDEX "Alert_adminId_idx" ON "Alert"("adminId");

CREATE INDEX "Notification_recipientType_recipientId_isRead_idx"
ON "Notification"("recipientType", "recipientId", "isRead");
CREATE INDEX "Notification_domainId_idx" ON "Notification"("domainId");
CREATE INDEX "Notification_alertId_idx" ON "Notification"("alertId");

ALTER TABLE "AlertRule"
ADD CONSTRAINT "AlertRule_domainId_fkey"
FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AlertRule"
ADD CONSTRAINT "AlertRule_adminId_fkey"
FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Alert"
ADD CONSTRAINT "Alert_domainId_fkey"
FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Alert"
ADD CONSTRAINT "Alert_adminId_fkey"
FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_alertId_fkey"
FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_domainId_fkey"
FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Notification"
ADD CONSTRAINT "Notification_adminId_fkey"
FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
