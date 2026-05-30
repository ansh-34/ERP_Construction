import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import { randomUUID } from 'crypto';
import type { MaintenanceAssetType } from './maintenanceSchedule.repository';

export type MovementType =
  | 'WAREHOUSE'
  | 'WAREHOUSE_TO_SITE'
  | 'SITE_TO_WAREHOUSE'
  | 'PROJECT_SITE'
  | 'SITE_TO_SITE'
  | 'OTHER';

export interface MovementLogRecord {
  id: string;
  code: string;
  movementType: MovementType;
  searchText: string;
  assetType: MaintenanceAssetType;
  vehicleId: string | null;
  machineryId: string | null;
  projectId: string | null;
  fromLocation: string | null;
  toLocation: string | null;
  startDateTime: Date;
  endDateTime: Date;
  hours: number;
  startMeterReading: number | null;
  endMeterReading: number | null;
  meterUsage: number | null;
  notes: string | null;
  domainId: string;
  adminId: string;
  vehicle?: Record<string, unknown> | null;
  machinery?: Record<string, unknown> | null;
  project?: Record<string, unknown> | null;
  status: StatusEnum;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMovementLogInput {
  code: string;
  movementType: MovementType;
  searchText: string;
  assetType: MaintenanceAssetType;
  vehicleId?: string | null;
  machineryId?: string | null;
  projectId?: string | null;
  fromLocation?: string | null;
  toLocation?: string | null;
  startDateTime: Date;
  endDateTime: Date;
  hours: number;
  startMeterReading?: number | null;
  endMeterReading?: number | null;
  meterUsage?: number | null;
  notes?: string | null;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

const movementLogSelect = Prisma.sql`
  ml."id",
  ml."code",
  ml."movementType",
  ml."searchText",
  ml."assetType",
  ml."vehicleId",
  ml."machineryId",
  ml."projectId",
  ml."fromLocation",
  ml."toLocation",
  ml."startDateTime",
  ml."endDateTime",
  ml."hours",
  ml."startMeterReading",
  ml."endMeterReading",
  ml."meterUsage",
  ml."notes",
  ml."domainId",
  ml."adminId",
  CASE
    WHEN v."id" IS NULL THEN NULL
    ELSE jsonb_build_object(
      'id', v."id",
      'numberPlate', v."numberPlate",
      'vehicleType', v."vehicleType",
      'status', v."status"
    )
  END AS "vehicle",
  CASE
    WHEN m."id" IS NULL THEN NULL
    ELSE jsonb_build_object(
      'id', m."id",
      'code', m."code",
      'type', m."type",
      'projectId', m."projectId",
      'status', m."status"
    )
  END AS "machinery",
  CASE
    WHEN p."id" IS NULL THEN NULL
    ELSE jsonb_build_object(
      'id', p."id",
      'code', p."code",
      'name', p."name",
      'locationId', p."locationId",
      'status', p."status"
    )
  END AS "project",
  ml."status",
  ml."isDeleted",
  ml."createdAt",
  ml."updatedAt"
`;

export const movementLogRepository = {
  create: async (data: CreateMovementLogInput): Promise<MovementLogRecord> => {
    const id = randomUUID();

    const result = await prisma.$queryRaw<MovementLogRecord[]>(Prisma.sql`
      INSERT INTO "MovementLog" (
        "id", "code", "movementType", "searchText", "assetType",
        "vehicleId", "machineryId", "projectId", "fromLocation", "toLocation",
        "startDateTime", "endDateTime", "hours", "startMeterReading",
        "endMeterReading", "meterUsage", "notes", "domainId", "adminId",
        "status", "isDeleted", "createdAt", "updatedAt"
      )
      VALUES (
        ${id}, ${data.code}, ${data.movementType}::"MovementType",
        ${data.searchText}, ${data.assetType}::"MaintenanceAssetType",
        ${data.vehicleId ?? null}, ${data.machineryId ?? null},
        ${data.projectId ?? null}, ${data.fromLocation ?? null},
        ${data.toLocation ?? null}, ${data.startDateTime}, ${data.endDateTime},
        ${data.hours}, ${data.startMeterReading ?? null},
        ${data.endMeterReading ?? null}, ${data.meterUsage ?? null},
        ${data.notes ?? null}, ${data.domainId}, ${data.adminId}, ${data.status},
        false, NOW(), NOW()
      )
      RETURNING
        "id", "code", "movementType", "searchText", "assetType", "vehicleId",
        "machineryId", "projectId", "fromLocation", "toLocation",
        "startDateTime", "endDateTime", "hours", "startMeterReading",
        "endMeterReading", "meterUsage", "notes", "domainId", "adminId",
        NULL AS "vehicle", NULL AS "machinery", NULL AS "project", "status",
        "isDeleted", "createdAt", "updatedAt"
    `);

    return result[0] as MovementLogRecord;
  },

  findMany: async (
    domainId: string,
    adminId?: string,
    filters: {
      assetType?: MaintenanceAssetType;
      movementType?: MovementType;
      vehicleId?: string;
      machineryId?: string;
      projectId?: string;
      searchKey?: string;
      fromDate?: Date;
      toDate?: Date;
    } = {},
  ): Promise<MovementLogRecord[]> => {
    const where = [
      Prisma.sql`ml."domainId" = ${domainId}`,
      Prisma.sql`ml."isDeleted" = false`,
    ];

    if (adminId) where.push(Prisma.sql`ml."adminId" = ${adminId}`);
    if (filters.assetType) {
      where.push(
        Prisma.sql`ml."assetType" = ${filters.assetType}::"MaintenanceAssetType"`,
      );
    }
    if (filters.movementType) {
      where.push(
        Prisma.sql`ml."movementType" = ${filters.movementType}::"MovementType"`,
      );
    }
    if (filters.vehicleId) {
      where.push(Prisma.sql`ml."vehicleId" = ${filters.vehicleId}`);
    }
    if (filters.machineryId) {
      where.push(Prisma.sql`ml."machineryId" = ${filters.machineryId}`);
    }
    if (filters.projectId) {
      where.push(Prisma.sql`ml."projectId" = ${filters.projectId}`);
    }
    if (filters.fromDate) {
      where.push(Prisma.sql`ml."startDateTime" >= ${filters.fromDate}`);
    }
    if (filters.toDate) {
      where.push(Prisma.sql`ml."endDateTime" <= ${filters.toDate}`);
    }
    if (filters.searchKey) {
      where.push(
        Prisma.sql`ml."searchText" LIKE ${`%${filters.searchKey.toLowerCase()}%`}`,
      );
    }

    return prisma.$queryRaw<MovementLogRecord[]>(Prisma.sql`
      SELECT ${movementLogSelect}
      FROM "MovementLog" ml
      LEFT JOIN "Vehicle" v ON v."id" = ml."vehicleId"
      LEFT JOIN "Machinery" m ON m."id" = ml."machineryId"
      LEFT JOIN "Project" p ON p."id" = ml."projectId"
      WHERE ${Prisma.join(where, ' AND ')}
      ORDER BY ml."startDateTime" DESC, ml."createdAt" DESC
    `);
  },

  findById: async (
    id: string,
    domainId: string,
    adminId?: string,
  ): Promise<MovementLogRecord | null> => {
    const where = [
      Prisma.sql`ml."id" = ${id}`,
      Prisma.sql`ml."domainId" = ${domainId}`,
      Prisma.sql`ml."isDeleted" = false`,
    ];

    if (adminId) where.push(Prisma.sql`ml."adminId" = ${adminId}`);

    const result = await prisma.$queryRaw<MovementLogRecord[]>(Prisma.sql`
      SELECT ${movementLogSelect}
      FROM "MovementLog" ml
      LEFT JOIN "Vehicle" v ON v."id" = ml."vehicleId"
      LEFT JOIN "Machinery" m ON m."id" = ml."machineryId"
      LEFT JOIN "Project" p ON p."id" = ml."projectId"
      WHERE ${Prisma.join(where, ' AND ')}
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  findByCode: async (
    code: string,
    domainId: string,
    adminId?: string,
  ): Promise<MovementLogRecord | null> => {
    const where = [
      Prisma.sql`"code" = ${code}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) where.push(Prisma.sql`"adminId" = ${adminId}`);

    const result = await prisma.$queryRaw<MovementLogRecord[]>(Prisma.sql`
      SELECT
        "id", "code", "movementType", "searchText", "assetType", "vehicleId",
        "machineryId", "projectId", "fromLocation", "toLocation",
        "startDateTime", "endDateTime", "hours", "startMeterReading",
        "endMeterReading", "meterUsage", "notes", "domainId", "adminId",
        NULL AS "vehicle", NULL AS "machinery", NULL AS "project", "status",
        "isDeleted", "createdAt", "updatedAt"
      FROM "MovementLog"
      WHERE ${Prisma.join(where, ' AND ')}
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId?: string,
  ): Promise<MovementLogRecord | null> => {
    const where = [
      Prisma.sql`"id" = ${id}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) where.push(Prisma.sql`"adminId" = ${adminId}`);

    const result = await prisma.$queryRaw<MovementLogRecord[]>(Prisma.sql`
      UPDATE "MovementLog"
      SET "isDeleted" = true, "updatedAt" = NOW()
      WHERE ${Prisma.join(where, ' AND ')}
      RETURNING
        "id", "code", "movementType", "searchText", "assetType", "vehicleId",
        "machineryId", "projectId", "fromLocation", "toLocation",
        "startDateTime", "endDateTime", "hours", "startMeterReading",
        "endMeterReading", "meterUsage", "notes", "domainId", "adminId",
        NULL AS "vehicle", NULL AS "machinery", NULL AS "project", "status",
        "isDeleted", "createdAt", "updatedAt"
    `);

    return result[0] ?? null;
  },
};
