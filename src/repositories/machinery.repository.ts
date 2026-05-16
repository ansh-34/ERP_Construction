import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import { randomUUID } from 'crypto';

type JsonObject = Record<string, unknown>;

export interface MachineryRecord {
  id: string;
  code: string;
  type: JsonObject;
  searchText: string;
  expectedLitrePerHour: number;
  projectId: string;
  domainId: string;
  adminId: string;
  status: StatusEnum;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMachineryInput {
  code: string;
  type: JsonObject;
  searchText: string;
  expectedLitrePerHour: number;
  projectId: string;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

export interface UpdateMachineryInput {
  code?: string;
  type?: JsonObject;
  searchText?: string;
  expectedLitrePerHour?: number;
  status?: StatusEnum;
}

const machinerySelect = Prisma.sql`
  "id",
  "code",
  "type",
  "expectedLitrePerHour",
  "projectId",
  "domainId",
  "adminId",
  "status",
  "isDeleted",
  "createdAt",
  "updatedAt"
`;

function toJsonbSql(value: JsonObject): Prisma.Sql {
  return Prisma.sql`${JSON.stringify(value)}::jsonb`;
}

export const machineryRepository = {
  create: async (data: CreateMachineryInput): Promise<MachineryRecord> => {
    const id = randomUUID();

    const result = await prisma.$queryRaw<MachineryRecord[]>(Prisma.sql`
      INSERT INTO "Machinery" (
        "id",
        "code",
        "type",
        "searchText",
        "expectedLitrePerHour",
        "projectId",
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
        ${toJsonbSql(data.type)},
        ${data.searchText},
        ${data.expectedLitrePerHour},
        ${data.projectId},
        ${data.domainId},
        ${data.adminId},
        ${data.status},
        false,
        NOW(),
        NOW()
      )
      RETURNING ${machinerySelect}
    `);

    return result[0] as MachineryRecord;
  },

  findMany: async (
    domainId: string,
    adminId?: string,
    projectId?: string,
    searchKey?: string,
  ): Promise<MachineryRecord[]> => {
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

    if (searchKey) {
      filters.push(
        Prisma.sql`"searchText" LIKE ${`%${searchKey.toLowerCase()}%`}`,
      );
    }

    return prisma.$queryRaw<MachineryRecord[]>(Prisma.sql`
      SELECT ${machinerySelect}
      FROM "Machinery"
      WHERE ${Prisma.join(filters, ' AND ')}
      ORDER BY "createdAt" DESC
    `);
  },

  findById: async (
    id: string,
    domainId: string,
    adminId?: string,
  ): Promise<MachineryRecord | null> => {
    const filters = [
      Prisma.sql`"id" = ${id}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<MachineryRecord[]>(Prisma.sql`
      SELECT ${machinerySelect}
      FROM "Machinery"
      WHERE ${Prisma.join(filters, ' AND ')}
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateMachineryInput,
    adminId?: string,
  ): Promise<MachineryRecord | null> => {
    const assignments = [Prisma.sql`"updatedAt" = NOW()`];

    if (data.code !== undefined) {
      assignments.unshift(Prisma.sql`"code" = ${data.code}`);
    }

    if (data.type !== undefined) {
      assignments.unshift(Prisma.sql`"type" = ${toJsonbSql(data.type)}`);
    }

    if (data.searchText !== undefined) {
      assignments.unshift(Prisma.sql`"searchText" = ${data.searchText}`);
    }

    if (data.expectedLitrePerHour !== undefined) {
      assignments.unshift(
        Prisma.sql`"expectedLitrePerHour" = ${data.expectedLitrePerHour}`,
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

    const result = await prisma.$queryRaw<MachineryRecord[]>(Prisma.sql`
      UPDATE "Machinery"
      SET ${Prisma.join(assignments)}
      WHERE ${Prisma.join(filters, ' AND ')}
      RETURNING ${machinerySelect}
    `);

    return result[0] ?? null;
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId?: string,
  ): Promise<MachineryRecord | null> => {
    const filters = [
      Prisma.sql`"id" = ${id}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<MachineryRecord[]>(Prisma.sql`
      UPDATE "Machinery"
      SET "isDeleted" = true, "status" = ${StatusEnum.INACTIVE}, "updatedAt" = NOW()
      WHERE ${Prisma.join(filters, ' AND ')}
      RETURNING ${machinerySelect}
    `);

    return result[0] ?? null;
  },

  bulkCreate(
    data: CreateMachineryInput[],
    options: { skipDuplicates?: boolean; transaction?: any } = {},
  ) {
    const prismaClient = options?.transaction || prisma;
    return prismaClient.machinery.createMany({
      data: data.map((item) => ({
        code: item.code,
        type: item.type,
        searchText: item.searchText,
        expectedLitrePerHour: item.expectedLitrePerHour,
        projectId: item.projectId,
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
