import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import { randomUUID } from 'crypto';

export interface MachineReadingRecord {
  id: string;
  code: string;
  searchText: string;
  date: Date;
  openingFuelStock: number;
  closingFuelStock: number | null;
  fuelRefillQuantity: number | null;
  hoursRun: number;
  machineStartTime: Date;
  machineEndTime: Date | null;
  projectId: string;
  domainId: string;
  status: StatusEnum;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMachineReadingInput {
  code: string;
  searchText: string;
  date: Date;
  openingFuelStock: number;
  closingFuelStock?: number | null;
  fuelRefillQuantity?: number | null;
  hoursRun: number;
  machineStartTime: Date;
  machineEndTime?: Date | null;
  projectId: string;
  domainId: string;
  status: StatusEnum;
}

export interface UpdateMachineReadingInput {
  closingFuelStock?: number;
  fuelRefillQuantity?: number | null;
  machineEndTime?: Date | null;
  hoursRun?: number;
  status?: StatusEnum;
}

const machineReadingSelect = Prisma.sql`
  "id",
  "code",
  "date",
  "openingFuelStock",
  "closingFuelStock",
  "fuelRefillQuantity",
  "hoursRun",
  "machineStartTime",
  "machineEndTime",
  "projectId",
  "domainId",
  "status",
  "isDeleted",
  "createdAt",
  "updatedAt"
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
        "hoursRun",
        "machineStartTime",
        "machineEndTime",
        "projectId",
        "domainId",
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
        ${data.openingFuelStock},
        ${toNumberSql(data.closingFuelStock ?? null)},
        ${toNumberSql(data.fuelRefillQuantity ?? null)},
        ${data.hoursRun},
        ${toDateSql(data.machineStartTime)},
        ${toDateSql(data.machineEndTime ?? null)},
        ${data.projectId},
        ${data.domainId},
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
    projectId?: string,
    searchKey?: string,
  ): Promise<MachineReadingRecord[]> => {
    const filters = [
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (projectId) {
      filters.push(Prisma.sql`"projectId" = ${projectId}`);
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
    `);
  },

  findById: async (
    id: string,
    domainId: string,
  ): Promise<MachineReadingRecord | null> => {
    const result = await prisma.$queryRaw<MachineReadingRecord[]>(Prisma.sql`
      SELECT ${machineReadingSelect}
      FROM "MachineReading"
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  findByCode: async (
    code: string,
    domainId: string,
    projectId: string,
  ): Promise<MachineReadingRecord | null> => {
    const result = await prisma.$queryRaw<MachineReadingRecord[]>(Prisma.sql`
      SELECT ${machineReadingSelect}
      FROM "MachineReading"
      WHERE "code" = ${code}
        AND "domainId" = ${domainId}
        AND "projectId" = ${projectId}
        AND "isDeleted" = false
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateMachineReadingInput,
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

    const result = await prisma.$queryRaw<MachineReadingRecord[]>(Prisma.sql`
      UPDATE "MachineReading"
      SET ${Prisma.join(assignments)}
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
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
        openingFuelStock: item.openingFuelStock,
        closingFuelStock: item.closingFuelStock || null,
        fuelRefillQuantity: item.fuelRefillQuantity || null,
        hoursRun: item.hoursRun,
        machineStartTime: item.machineStartTime,
        machineEndTime: item.machineEndTime || null,
        projectId: item.projectId,
        domainId: item.domainId,
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
