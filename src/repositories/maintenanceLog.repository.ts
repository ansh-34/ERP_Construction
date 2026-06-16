import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import { randomUUID } from 'crypto';
import type { MaintenanceAssetType } from './maintenanceSchedule.repository';

type JsonObject = Record<string, unknown>;

export interface MaintenanceLogRecord {
  id: string;
  code: string;
  date: Date;
  description: JsonObject;
  searchText: string;
  assetType: MaintenanceAssetType;
  vehicleId: string | null;
  machineryId: string | null;
  maintenanceScheduleId: string | null;
  expenseAmount: number;
  meterReading: number | null;
  domainId: string;
  adminId: string;
  vehicle?: Record<string, unknown> | null;
  machinery?: Record<string, unknown> | null;
  maintenanceSchedule?: Record<string, unknown> | null;
  status: StatusEnum;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMaintenanceLogInput {
  code: string;
  date: Date;
  description: JsonObject;
  searchText: string;
  assetType: MaintenanceAssetType;
  vehicleId?: string | null;
  machineryId?: string | null;
  maintenanceScheduleId?: string | null;
  expenseAmount: number;
  meterReading?: number | null;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

const maintenanceLogSelect = Prisma.sql`
  ml."id",
  ml."code",
  ml."date",
  ml."description",
  ml."searchText",
  ml."assetType",
  ml."vehicleId",
  ml."machineryId",
  ml."maintenanceScheduleId",
  ml."expenseAmount",
  ml."meterReading",
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
    WHEN ms."id" IS NULL THEN NULL
    ELSE jsonb_build_object(
      'id', ms."id",
      'code', ms."code",
      'title', ms."title",
      'nextDueDate', ms."nextDueDate",
      'scheduleStatus', ms."scheduleStatus"
    )
  END AS "maintenanceSchedule",
  ml."status",
  ml."isDeleted",
  ml."createdAt",
  ml."updatedAt"
`;

export const maintenanceLogRepository = {
  create: async (
    data: CreateMaintenanceLogInput,
  ): Promise<MaintenanceLogRecord> => {
    const id = randomUUID();

    const result = await prisma.$queryRaw<MaintenanceLogRecord[]>(Prisma.sql`
      INSERT INTO "MaintenanceLog" (
        "id",
        "code",
        "date",
        "description",
        "searchText",
        "assetType",
        "vehicleId",
        "machineryId",
        "maintenanceScheduleId",
        "expenseAmount",
        "meterReading",
        "domainId",
        "adminId",
        "status",
        "isDeleted",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${id},
        ${data.code},
        ${data.date},
        ${JSON.stringify(data.description)}::jsonb,
        ${data.searchText},
        ${data.assetType}::"MaintenanceAssetType",
        ${data.vehicleId ?? null},
        ${data.machineryId ?? null},
        ${data.maintenanceScheduleId ?? null},
        ${data.expenseAmount},
        ${data.meterReading ?? null},
        ${data.domainId},
        ${data.adminId},
        ${data.status},
        false,
        NOW(),
        NOW()
      )
      RETURNING
        "id",
        "code",
        "date",
        "description",
        "searchText",
        "assetType",
        "vehicleId",
        "machineryId",
        "maintenanceScheduleId",
        "expenseAmount",
        "meterReading",
        "domainId",
        "adminId",
        NULL AS "vehicle",
        NULL AS "machinery",
        NULL AS "maintenanceSchedule",
        "status",
        "isDeleted",
        "createdAt",
        "updatedAt"
    `);

    return result[0] as MaintenanceLogRecord;
  },

  findMany: async (
    domainId: string,
    adminId?: string,
    filters: {
      assetType?: MaintenanceAssetType;
      vehicleId?: string;
      machineryId?: string;
      maintenanceScheduleId?: string;
      status?: StatusEnum;
      searchKey?: string;
      fromDate?: Date;
      toDate?: Date;
    } = {},
  ): Promise<MaintenanceLogRecord[]> => {
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
    if (filters.vehicleId) {
      where.push(Prisma.sql`ml."vehicleId" = ${filters.vehicleId}`);
    }
    if (filters.machineryId) {
      where.push(Prisma.sql`ml."machineryId" = ${filters.machineryId}`);
    }
    if (filters.maintenanceScheduleId) {
      where.push(
        Prisma.sql`ml."maintenanceScheduleId" = ${filters.maintenanceScheduleId}`,
      );
    }
    if (filters.status) {
      where.push(Prisma.sql`ml."status" = ${filters.status}`);
    }
    if (filters.fromDate) {
      where.push(Prisma.sql`ml."date" >= ${filters.fromDate}`);
    }
    if (filters.toDate) {
      where.push(Prisma.sql`ml."date" <= ${filters.toDate}`);
    }
    if (filters.searchKey) {
      where.push(
        Prisma.sql`ml."searchText" LIKE ${`%${filters.searchKey.toLowerCase()}%`}`,
      );
    }

    return prisma.$queryRaw<MaintenanceLogRecord[]>(Prisma.sql`
      SELECT ${maintenanceLogSelect}
      FROM "MaintenanceLog" ml
      LEFT JOIN "Vehicle" v ON v."id" = ml."vehicleId"
      LEFT JOIN "Machinery" m ON m."id" = ml."machineryId"
      LEFT JOIN "MaintenanceSchedule" ms ON ms."id" = ml."maintenanceScheduleId"
      WHERE ${Prisma.join(where, ' AND ')}
      ORDER BY ml."date" DESC, ml."createdAt" DESC
    `);
  },

  findById: async (
    id: string,
    domainId: string,
    adminId?: string,
  ): Promise<MaintenanceLogRecord | null> => {
    const where = [
      Prisma.sql`ml."id" = ${id}`,
      Prisma.sql`ml."domainId" = ${domainId}`,
      Prisma.sql`ml."isDeleted" = false`,
    ];

    if (adminId) where.push(Prisma.sql`ml."adminId" = ${adminId}`);

    const result = await prisma.$queryRaw<MaintenanceLogRecord[]>(Prisma.sql`
      SELECT ${maintenanceLogSelect}
      FROM "MaintenanceLog" ml
      LEFT JOIN "Vehicle" v ON v."id" = ml."vehicleId"
      LEFT JOIN "Machinery" m ON m."id" = ml."machineryId"
      LEFT JOIN "MaintenanceSchedule" ms ON ms."id" = ml."maintenanceScheduleId"
      WHERE ${Prisma.join(where, ' AND ')}
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  findByCode: async (
    code: string,
    domainId: string,
    adminId?: string,
  ): Promise<MaintenanceLogRecord | null> => {
    const where = [
      Prisma.sql`"code" = ${code}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) where.push(Prisma.sql`"adminId" = ${adminId}`);

    const result = await prisma.$queryRaw<MaintenanceLogRecord[]>(Prisma.sql`
      SELECT
        "id",
        "code",
        "date",
        "description",
        "searchText",
        "assetType",
        "vehicleId",
        "machineryId",
        "maintenanceScheduleId",
        "expenseAmount",
        "meterReading",
        "domainId",
        "adminId",
        NULL AS "vehicle",
        NULL AS "machinery",
        NULL AS "maintenanceSchedule",
        "status",
        "isDeleted",
        "createdAt",
        "updatedAt"
      FROM "MaintenanceLog"
      WHERE ${Prisma.join(where, ' AND ')}
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId?: string,
  ): Promise<MaintenanceLogRecord | null> => {
    const where = [
      Prisma.sql`"id" = ${id}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) where.push(Prisma.sql`"adminId" = ${adminId}`);

    const result = await prisma.$queryRaw<MaintenanceLogRecord[]>(Prisma.sql`
      UPDATE "MaintenanceLog"
      SET "isDeleted" = true, "updatedAt" = NOW()
      WHERE ${Prisma.join(where, ' AND ')}
      RETURNING
        "id",
        "code",
        "date",
        "description",
        "searchText",
        "assetType",
        "vehicleId",
        "machineryId",
        "maintenanceScheduleId",
        "expenseAmount",
        "meterReading",
        "domainId",
        "adminId",
        NULL AS "vehicle",
        NULL AS "machinery",
        NULL AS "maintenanceSchedule",
        "status",
        "isDeleted",
        "createdAt",
        "updatedAt"
    `);

    return result[0] ?? null;
  },
};
