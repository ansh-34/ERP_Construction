import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import { randomUUID } from 'crypto';

type RelationDetails = Record<string, unknown> | null;

export interface MachineReadingRecord {
  id: string;
  code: string;
  searchText: string;
  date: Date;
  refillFuelStock: number;
  closingFuelStock: number | null;
  fuelRefillQuantity: number | null;
  fuelConsumed: number | null;
  actualLitrePerHour: number | null;
  hoursRun: number;
  machineStartTime: Date;
  machineEndTime: Date | null;
  projectId: string;
  machineryId: string | null;
  domainId: string;
  adminId: string;
  project?: RelationDetails;
  machinery?: RelationDetails;
  domain?: RelationDetails;
  admin?: RelationDetails;
  status: StatusEnum;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMachineReadingInput {
  code: string;
  searchText: string;
  date: Date;
  refillFuelStock: number;
  closingFuelStock?: number | null;
  fuelRefillQuantity?: number | null;
  fuelConsumed?: number | null;
  actualLitrePerHour?: number | null;
  hoursRun: number;
  machineStartTime: Date;
  machineEndTime?: Date | null;
  projectId: string;
  machineryId: string;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

export interface UpdateMachineReadingInput {
  closingFuelStock?: number;
  fuelRefillQuantity?: number | null;
  fuelConsumed?: number | null;
  actualLitrePerHour?: number | null;
  machineEndTime?: Date | null;
  hoursRun?: number;
  status?: StatusEnum;
}

const machineReadingSelect = Prisma.sql`
  "id",
  "code",
  "date",
  "openingFuelStock" AS "refillFuelStock",
  "closingFuelStock",
  "fuelRefillQuantity",
  "fuelConsumed",
  "actualLitrePerHour",
  "hoursRun",
  "machineStartTime",
  "machineEndTime",
  "projectId",
  "machineryId",
  "domainId",
  "adminId",
  "status",
  "isDeleted",
  "createdAt",
  "updatedAt"
`;

const machineReadingListSelect = Prisma.sql`
  mr."id",
  mr."code",
  mr."date",
  mr."openingFuelStock" AS "refillFuelStock",
  mr."closingFuelStock",
  mr."fuelRefillQuantity",
  mr."fuelConsumed",
  mr."actualLitrePerHour",
  mr."hoursRun",
  mr."machineStartTime",
  mr."machineEndTime",
  mr."projectId",
  mr."machineryId",
  jsonb_build_object(
    'id', p."id",
    'name', p."name",
    'code', p."code"
  ) AS "project",
  jsonb_build_object(
    'id', m."id",
    'code', m."code",
    'type', m."type",
    'expectedLitrePerHour', m."expectedLitrePerHour"
  ) AS "machinery",
  mr."domainId",
  jsonb_build_object(
    'id', d."id",
    'name', d."name",
    'email', d."email"
  ) AS "domain",
  mr."adminId",
  jsonb_build_object(
    'id', a."id",
    'name', a."name",
    'email', a."email"
  ) AS "admin",
  mr."status",
  mr."isDeleted",
  mr."createdAt",
  mr."updatedAt"
`;

function toDateSql(value: Date | null | undefined): Prisma.Sql {
  return value === null || value === undefined
    ? Prisma.sql`NULL`
    : Prisma.sql`${value}`;
}

function toNumberSql(value: number | null | undefined): Prisma.Sql {
  return value === null || value === undefined
    ? Prisma.sql`NULL`
    : Prisma.sql`${value}`;
}

export const machineReadingRepository = {
  create: async (
    data: CreateMachineReadingInput,
  ): Promise<MachineReadingRecord> => {
    const id = randomUUID();

    const result = await prisma.$queryRaw<MachineReadingRecord[]>(Prisma.sql`
      INSERT INTO "MachineReading" (
        "id",
        "code",
        "searchText",
        "date",
        "openingFuelStock",
        "closingFuelStock",
        "fuelRefillQuantity",
        "fuelConsumed",
        "actualLitrePerHour",
        "hoursRun",
        "machineStartTime",
        "machineEndTime",
        "projectId",
        "machineryId",
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
        ${data.searchText},
        ${toDateSql(data.date)},
        ${data.refillFuelStock},
        ${toNumberSql(data.closingFuelStock ?? null)},
        ${toNumberSql(data.fuelRefillQuantity ?? null)},
        ${toNumberSql(data.fuelConsumed ?? null)},
        ${toNumberSql(data.actualLitrePerHour ?? null)},
        ${data.hoursRun},
        ${toDateSql(data.machineStartTime)},
        ${toDateSql(data.machineEndTime ?? null)},
        ${data.projectId},
        ${data.machineryId},
        ${data.domainId},
        ${data.adminId},
        ${data.status},
        false,
        NOW(),
        NOW()
      )
      RETURNING ${machineReadingSelect}
    `);

    return result[0] as MachineReadingRecord;
  },

  findMany: async (
    domainId: string,
    adminId?: string,
    projectId?: string,
    machineryId?: string,
    searchKey?: string,
    offset = 0,
    limit = 10,
  ): Promise<MachineReadingRecord[]> => {
    const filters = [
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    if (projectId) {
      filters.push(Prisma.sql`"projectId" = ${projectId}`);
    }

    if (machineryId) {
      filters.push(Prisma.sql`"machineryId" = ${machineryId}`);
    }

    if (searchKey) {
      filters.push(
        Prisma.sql`"searchText" LIKE ${`%${searchKey.toLowerCase()}%`}`,
      );
    }

    return prisma.$queryRaw<MachineReadingRecord[]>(Prisma.sql`
      SELECT ${machineReadingSelect}
      FROM "MachineReading"
      WHERE ${Prisma.join(filters, ' AND ')}
      ORDER BY "createdAt" DESC
      OFFSET ${offset}
      LIMIT ${limit}
    `);
  },

  findManyWithDetails: async (
    domainId: string,
    adminId?: string,
    projectId?: string,
    machineryId?: string,
    searchKey?: string,
    offset = 0,
    limit = 10,
  ): Promise<MachineReadingRecord[]> => {
    const filters = [
      Prisma.sql`mr."domainId" = ${domainId}`,
      Prisma.sql`mr."isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`mr."adminId" = ${adminId}`);
    }

    if (projectId) {
      filters.push(Prisma.sql`mr."projectId" = ${projectId}`);
    }

    if (machineryId) {
      filters.push(Prisma.sql`mr."machineryId" = ${machineryId}`);
    }

    if (searchKey) {
      filters.push(
        Prisma.sql`mr."searchText" LIKE ${`%${searchKey.toLowerCase()}%`}`,
      );
    }

    return prisma.$queryRaw<MachineReadingRecord[]>(Prisma.sql`
      SELECT ${machineReadingListSelect}
      FROM "MachineReading" mr
      INNER JOIN "Project" p ON p."id" = mr."projectId"
      INNER JOIN "Machinery" m ON m."id" = mr."machineryId"
      INNER JOIN "Domain" d ON d."id" = mr."domainId"
      INNER JOIN "Admin" a ON a."id" = mr."adminId"
      WHERE ${Prisma.join(filters, ' AND ')}
      ORDER BY mr."createdAt" DESC
      OFFSET ${offset}
      LIMIT ${limit}
    `);
  },

  count: async (
    domainId: string,
    adminId?: string,
    projectId?: string,
    machineryId?: string,
    searchKey?: string,
  ): Promise<number> => {
    const filters = [
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    if (projectId) {
      filters.push(Prisma.sql`"projectId" = ${projectId}`);
    }

    if (machineryId) {
      filters.push(Prisma.sql`"machineryId" = ${machineryId}`);
    }

    if (searchKey) {
      filters.push(
        Prisma.sql`"searchText" LIKE ${`%${searchKey.toLowerCase()}%`}`,
      );
    }

    const result = await prisma.$queryRaw<{ count: bigint }[]>(Prisma.sql`
      SELECT COUNT(*) AS "count"
      FROM "MachineReading"
      WHERE ${Prisma.join(filters, ' AND ')}
    `);

    return Number(result[0]?.count ?? 0);
  },

  findById: async (
    id: string,
    domainId: string,
    adminId?: string,
  ): Promise<MachineReadingRecord | null> => {
    const filters = [
      Prisma.sql`"id" = ${id}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<MachineReadingRecord[]>(Prisma.sql`
      SELECT ${machineReadingSelect}
      FROM "MachineReading"
      WHERE ${Prisma.join(filters, ' AND ')}
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  findByCode: async (
    code: string,
    domainId: string,
    projectId: string,
    adminId?: string,
  ): Promise<MachineReadingRecord | null> => {
    const filters = [
      Prisma.sql`"code" = ${code}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"projectId" = ${projectId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<MachineReadingRecord[]>(Prisma.sql`
      SELECT ${machineReadingSelect}
      FROM "MachineReading"
      WHERE ${Prisma.join(filters, ' AND ')}
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  findLatestUnfinalizedBefore: async (
    projectId: string,
    machineryId: string,
    domainId: string,
    adminId: string,
    beforeCreatedAt: Date,
  ): Promise<MachineReadingRecord | null> => {
    const result = await prisma.$queryRaw<MachineReadingRecord[]>(Prisma.sql`
      SELECT ${machineReadingSelect}
      FROM "MachineReading"
      WHERE "projectId" = ${projectId}
        AND "machineryId" = ${machineryId}
        AND "domainId" = ${domainId}
        AND "adminId" = ${adminId}
        AND "isDeleted" = false
        AND "fuelConsumed" IS NULL
        AND "createdAt" < ${beforeCreatedAt}
      ORDER BY "createdAt" DESC
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateMachineReadingInput,
    adminId?: string,
  ): Promise<MachineReadingRecord | null> => {
    const assignments = [Prisma.sql`"updatedAt" = NOW()`];

    if (data.closingFuelStock !== undefined) {
      assignments.unshift(
        Prisma.sql`"closingFuelStock" = ${data.closingFuelStock}`,
      );
    }

    if (data.fuelRefillQuantity !== undefined) {
      assignments.unshift(
        Prisma.sql`"fuelRefillQuantity" = ${toNumberSql(
          data.fuelRefillQuantity,
        )}`,
      );
    }

    if (data.fuelConsumed !== undefined) {
      assignments.unshift(
        Prisma.sql`"fuelConsumed" = ${toNumberSql(data.fuelConsumed)}`,
      );
    }

    if (data.actualLitrePerHour !== undefined) {
      assignments.unshift(
        Prisma.sql`"actualLitrePerHour" = ${toNumberSql(
          data.actualLitrePerHour,
        )}`,
      );
    }

    if (data.hoursRun !== undefined) {
      assignments.unshift(Prisma.sql`"hoursRun" = ${data.hoursRun}`);
    }

    if (data.machineEndTime !== undefined) {
      assignments.unshift(
        Prisma.sql`"machineEndTime" = ${toDateSql(data.machineEndTime)}`,
      );
    }

    if (data.status !== undefined) {
      assignments.unshift(Prisma.sql`"status" = ${data.status}`);
    }

    const filters = [
      Prisma.sql`"id" = ${id}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<MachineReadingRecord[]>(Prisma.sql`
      UPDATE "MachineReading"
      SET ${Prisma.join(assignments)}
      WHERE ${Prisma.join(filters, ' AND ')}
      RETURNING ${machineReadingSelect}
    `);

    return result[0] ?? null;
  },

  bulkCreate(
    data: CreateMachineReadingInput[],
    options: { skipDuplicates?: boolean; transaction?: any } = {},
  ) {
    const prismaClient = options?.transaction || prisma;

    return prismaClient.machineReading.createMany({
      data: data.map((item) => ({
        code: item.code,
        searchText: item.searchText,
        date: item.date,
        openingFuelStock: item.refillFuelStock,
        closingFuelStock: item.closingFuelStock ?? null,
        fuelRefillQuantity: item.fuelRefillQuantity ?? null,
        fuelConsumed: item.fuelConsumed ?? null,
        actualLitrePerHour: item.actualLitrePerHour ?? null,
        hoursRun: item.hoursRun,
        machineStartTime: item.machineStartTime,
        machineEndTime: item.machineEndTime ?? null,
        projectId: item.projectId,
        machineryId: item.machineryId,
        domainId: item.domainId,
        adminId: item.adminId,
        status: item.status,
      })),
      skipDuplicates: Object.prototype.hasOwnProperty.call(
        options,
        'skipDuplicates',
      )
        ? options.skipDuplicates
        : true,
    });
  },
};
