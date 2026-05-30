import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import { randomUUID } from 'crypto';

type JsonObject = Record<string, unknown>;

export type MaintenanceAssetType = 'VEHICLE' | 'MACHINERY';
export type MaintenanceScheduleStatus =
  | 'SCHEDULED'
  | 'OVERDUE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface MaintenanceScheduleRecord {
  id: string;
  code: string;
  title: JsonObject;
  searchText: string;
  assetType: MaintenanceAssetType;
  vehicleId: string | null;
  machineryId: string | null;
  nextDueDate: Date;
  scheduleStatus: MaintenanceScheduleStatus;
  domainId: string;
  adminId: string;
  vehicle?: Record<string, unknown> | null;
  machinery?: Record<string, unknown> | null;
  status: StatusEnum;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMaintenanceScheduleInput {
  code: string;
  title: JsonObject;
  searchText: string;
  assetType: MaintenanceAssetType;
  vehicleId?: string | null;
  machineryId?: string | null;
  nextDueDate: Date;
  scheduleStatus: MaintenanceScheduleStatus;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

export interface UpdateMaintenanceScheduleInput {
  code?: string;
  title?: JsonObject;
  searchText?: string;
  assetType?: MaintenanceAssetType;
  vehicleId?: string | null;
  machineryId?: string | null;
  nextDueDate?: Date;
  scheduleStatus?: MaintenanceScheduleStatus;
  status?: StatusEnum;
}

const maintenanceScheduleSelect = Prisma.sql`
  ms."id",
  ms."code",
  ms."title",
  ms."searchText",
  ms."assetType",
  ms."vehicleId",
  ms."machineryId",
  ms."nextDueDate",
  ms."scheduleStatus",
  ms."domainId",
  ms."adminId",
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
  ms."status",
  ms."isDeleted",
  ms."createdAt",
  ms."updatedAt"
`;

export const maintenanceScheduleRepository = {
  create: async (
    data: CreateMaintenanceScheduleInput,
  ): Promise<MaintenanceScheduleRecord> => {
    const id = randomUUID();

    const result = await prisma.$queryRaw<MaintenanceScheduleRecord[]>(
      Prisma.sql`
        INSERT INTO "MaintenanceSchedule" (
          "id",
          "code",
          "title",
          "searchText",
          "assetType",
          "vehicleId",
          "machineryId",
          "nextDueDate",
          "scheduleStatus",
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
          ${JSON.stringify(data.title)}::jsonb,
          ${data.searchText},
          ${data.assetType}::"MaintenanceAssetType",
          ${data.vehicleId ?? null},
          ${data.machineryId ?? null},
          ${data.nextDueDate},
          ${data.scheduleStatus}::"MaintenanceScheduleStatus",
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
          "title",
          "searchText",
          "assetType",
          "vehicleId",
          "machineryId",
          "nextDueDate",
          "scheduleStatus",
          "domainId",
          "adminId",
          NULL AS "vehicle",
          NULL AS "machinery",
          "status",
          "isDeleted",
          "createdAt",
          "updatedAt"
      `,
    );

    return result[0] as MaintenanceScheduleRecord;
  },

  findMany: async (
    domainId: string,
    adminId?: string,
    filters: {
      assetType?: MaintenanceAssetType;
      scheduleStatus?: MaintenanceScheduleStatus;
      vehicleId?: string;
      machineryId?: string;
      searchKey?: string;
      fromDate?: Date;
      toDate?: Date;
    } = {},
  ): Promise<MaintenanceScheduleRecord[]> => {
    const where = [
      Prisma.sql`ms."domainId" = ${domainId}`,
      Prisma.sql`ms."isDeleted" = false`,
    ];

    if (adminId) where.push(Prisma.sql`ms."adminId" = ${adminId}`);
    if (filters.assetType) {
      where.push(
        Prisma.sql`ms."assetType" = ${filters.assetType}::"MaintenanceAssetType"`,
      );
    }
    if (filters.scheduleStatus) {
      where.push(
        Prisma.sql`ms."scheduleStatus" = ${filters.scheduleStatus}::"MaintenanceScheduleStatus"`,
      );
    }
    if (filters.vehicleId) {
      where.push(Prisma.sql`ms."vehicleId" = ${filters.vehicleId}`);
    }
    if (filters.machineryId) {
      where.push(Prisma.sql`ms."machineryId" = ${filters.machineryId}`);
    }
    if (filters.fromDate) {
      where.push(Prisma.sql`ms."nextDueDate" >= ${filters.fromDate}`);
    }
    if (filters.toDate) {
      where.push(Prisma.sql`ms."nextDueDate" <= ${filters.toDate}`);
    }
    if (filters.searchKey) {
      where.push(
        Prisma.sql`ms."searchText" LIKE ${`%${filters.searchKey.toLowerCase()}%`}`,
      );
    }

    return prisma.$queryRaw<MaintenanceScheduleRecord[]>(Prisma.sql`
      SELECT ${maintenanceScheduleSelect}
      FROM "MaintenanceSchedule" ms
      LEFT JOIN "Vehicle" v ON v."id" = ms."vehicleId"
      LEFT JOIN "Machinery" m ON m."id" = ms."machineryId"
      WHERE ${Prisma.join(where, ' AND ')}
      ORDER BY ms."nextDueDate" ASC, ms."createdAt" DESC
    `);
  },

  findById: async (
    id: string,
    domainId: string,
    adminId?: string,
  ): Promise<MaintenanceScheduleRecord | null> => {
    const where = [
      Prisma.sql`ms."id" = ${id}`,
      Prisma.sql`ms."domainId" = ${domainId}`,
      Prisma.sql`ms."isDeleted" = false`,
    ];

    if (adminId) where.push(Prisma.sql`ms."adminId" = ${adminId}`);

    const result = await prisma.$queryRaw<MaintenanceScheduleRecord[]>(
      Prisma.sql`
        SELECT ${maintenanceScheduleSelect}
        FROM "MaintenanceSchedule" ms
        LEFT JOIN "Vehicle" v ON v."id" = ms."vehicleId"
        LEFT JOIN "Machinery" m ON m."id" = ms."machineryId"
        WHERE ${Prisma.join(where, ' AND ')}
        LIMIT 1
      `,
    );

    return result[0] ?? null;
  },

  findByCode: async (
    code: string,
    domainId: string,
    adminId?: string,
  ): Promise<MaintenanceScheduleRecord | null> => {
    const where = [
      Prisma.sql`"code" = ${code}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) where.push(Prisma.sql`"adminId" = ${adminId}`);

    const result = await prisma.$queryRaw<MaintenanceScheduleRecord[]>(
      Prisma.sql`
        SELECT
          "id",
          "code",
          "title",
          "searchText",
          "assetType",
          "vehicleId",
          "machineryId",
          "nextDueDate",
          "scheduleStatus",
          "domainId",
          "adminId",
          NULL AS "vehicle",
          NULL AS "machinery",
          "status",
          "isDeleted",
          "createdAt",
          "updatedAt"
        FROM "MaintenanceSchedule"
        WHERE ${Prisma.join(where, ' AND ')}
        LIMIT 1
      `,
    );

    return result[0] ?? null;
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateMaintenanceScheduleInput,
    adminId?: string,
  ): Promise<MaintenanceScheduleRecord | null> => {
    const assignments = [Prisma.sql`"updatedAt" = NOW()`];

    if (data.code !== undefined)
      assignments.unshift(Prisma.sql`"code" = ${data.code}`);
    if (data.title !== undefined) {
      assignments.unshift(
        Prisma.sql`"title" = ${JSON.stringify(data.title)}::jsonb`,
      );
    }
    if (data.searchText !== undefined) {
      assignments.unshift(Prisma.sql`"searchText" = ${data.searchText}`);
    }
    if (data.assetType !== undefined) {
      assignments.unshift(
        Prisma.sql`"assetType" = ${data.assetType}::"MaintenanceAssetType"`,
      );
    }
    if (data.vehicleId !== undefined) {
      assignments.unshift(Prisma.sql`"vehicleId" = ${data.vehicleId}`);
    }
    if (data.machineryId !== undefined) {
      assignments.unshift(Prisma.sql`"machineryId" = ${data.machineryId}`);
    }
    if (data.nextDueDate !== undefined) {
      assignments.unshift(Prisma.sql`"nextDueDate" = ${data.nextDueDate}`);
    }
    if (data.scheduleStatus !== undefined) {
      assignments.unshift(
        Prisma.sql`"scheduleStatus" = ${data.scheduleStatus}::"MaintenanceScheduleStatus"`,
      );
    }
    if (data.status !== undefined) {
      assignments.unshift(Prisma.sql`"status" = ${data.status}`);
    }

    const where = [
      Prisma.sql`"id" = ${id}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) where.push(Prisma.sql`"adminId" = ${adminId}`);

    const result = await prisma.$queryRaw<MaintenanceScheduleRecord[]>(
      Prisma.sql`
        UPDATE "MaintenanceSchedule"
        SET ${Prisma.join(assignments)}
        WHERE ${Prisma.join(where, ' AND ')}
        RETURNING
          "id",
          "code",
          "title",
          "searchText",
          "assetType",
          "vehicleId",
          "machineryId",
          "nextDueDate",
          "scheduleStatus",
          "domainId",
          "adminId",
          NULL AS "vehicle",
          NULL AS "machinery",
          "status",
          "isDeleted",
          "createdAt",
          "updatedAt"
      `,
    );

    return result[0] ?? null;
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId?: string,
  ): Promise<MaintenanceScheduleRecord | null> => {
    const where = [
      Prisma.sql`"id" = ${id}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) where.push(Prisma.sql`"adminId" = ${adminId}`);

    const result = await prisma.$queryRaw<MaintenanceScheduleRecord[]>(
      Prisma.sql`
        UPDATE "MaintenanceSchedule"
        SET "isDeleted" = true, "status" = ${StatusEnum.INACTIVE}, "updatedAt" = NOW()
        WHERE ${Prisma.join(where, ' AND ')}
        RETURNING
          "id",
          "code",
          "title",
          "searchText",
          "assetType",
          "vehicleId",
          "machineryId",
          "nextDueDate",
          "scheduleStatus",
          "domainId",
          "adminId",
          NULL AS "vehicle",
          NULL AS "machinery",
          "status",
          "isDeleted",
          "createdAt",
          "updatedAt"
      `,
    );

    return result[0] ?? null;
  },
};
