import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import { randomUUID } from 'crypto';

type JsonObject = Record<string, unknown>;

export interface ProjectRecord {
  id: string;
  name: JsonObject;
  code: string;
  searchText: string;
  description: JsonObject | null;
  budget: number;
  spent: number;
  locationId: string;
  domainId: string;
  adminId: string;
  status: StatusEnum;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: JsonObject;
  code: string;
  searchText: string;
  description?: JsonObject | null;
  budget: number;
  spent?: number;
  locationId: string;
  domainId: string;
  adminId: string;
  status: StatusEnum;
}

export interface UpdateProjectInput {
  name?: JsonObject;
  code?: string;
  description?: JsonObject | null;
  searchText?: string;
  budget?: number;
  spent?: number;
  locationId?: string;
  status?: StatusEnum;
}

const projectSelect = Prisma.sql`
  "id",
  "name",
  "code",
  "description",
  "budget",
  "spent",
  "locationId",
  "domainId",
  "adminId",
  "status",
  "isDeleted",
  "createdAt",
  "updatedAt"
`;

function toJsonbSql(value: JsonObject | null | undefined): Prisma.Sql {
  return value === null || value === undefined
    ? Prisma.sql`NULL`
    : Prisma.sql`${JSON.stringify(value)}::jsonb`;
}

export const projectRepository = {
  create: async (data: CreateProjectInput): Promise<ProjectRecord> => {
    const id = randomUUID();
    const descriptionSql = toJsonbSql(data.description);

    const result = await prisma.$queryRaw<ProjectRecord[]>(Prisma.sql`
      INSERT INTO "Project" ("id", "name", "code", "searchText", "description", "budget", "spent", "locationId", "domainId", "adminId", "status", "isDeleted", "createdAt", "updatedAt")
      VALUES (
        ${id},
        ${JSON.stringify(data.name)}::jsonb,
        ${data.code},
        ${data.searchText},
        ${descriptionSql},
        ${data.budget},
        ${data.spent ?? 0},
        ${data.locationId},
        ${data.domainId},
        ${data.adminId},
        ${data.status},
        false,
        NOW(),
        NOW()
      )
      RETURNING *
    `);

    return result[0] as ProjectRecord;
  },

  findMany: async (
    domainId: string,
    searchKey?: string,
    adminId?: string,
  ): Promise<ProjectRecord[]> => {
    const filters = [
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    if (searchKey) {
      filters.push(
        Prisma.sql`"searchText" LIKE ${`%${searchKey.toLowerCase()}%`}`,
      );
    }

    return prisma.$queryRaw<ProjectRecord[]>(Prisma.sql`
      SELECT ${projectSelect}
      FROM "Project"
      WHERE ${Prisma.join(filters, ' AND ')}
      ORDER BY "createdAt" DESC
    `);
  },

  findManyByIds: async (
    ids: string[],
    domainId: string,
    adminId?: string,
  ): Promise<ProjectRecord[]> => {
    if (ids.length === 0) return [];

    const filters = [
      Prisma.sql`"id" = ANY(${ids}::text[])`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    return prisma.$queryRaw<ProjectRecord[]>(Prisma.sql`
      SELECT ${projectSelect}
      FROM "Project"
      WHERE ${Prisma.join(filters, ' AND ')}
      ORDER BY "createdAt" DESC
    `);
  },

  findById: async (
    id: string,
    domainId: string,
    adminId?: string,
  ): Promise<ProjectRecord | null> => {
    const filters = [
      Prisma.sql`"id" = ${id}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<ProjectRecord[]>(Prisma.sql`
      SELECT ${projectSelect}
      FROM "Project"
      WHERE ${Prisma.join(filters, ' AND ')}
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  findByCode: async (
    code: string,
    domainId: string,
    adminId?: string,
  ): Promise<ProjectRecord | null> => {
    const filters = [
      Prisma.sql`"code" = ${code}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<ProjectRecord[]>(Prisma.sql`
      SELECT ${projectSelect}
      FROM "Project"
      WHERE ${Prisma.join(filters, ' AND ')}
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateProjectInput,
    adminId?: string,
  ): Promise<ProjectRecord | null> => {
    const assignments = [Prisma.sql`"updatedAt" = NOW()`];

    if (data.name !== undefined) {
      assignments.unshift(
        Prisma.sql`"name" = ${JSON.stringify(data.name)}::jsonb`,
      );
    }

    if (data.code !== undefined) {
      assignments.unshift(Prisma.sql`"code" = ${data.code}`);
    }

    if (data.description !== undefined) {
      assignments.unshift(
        Prisma.sql`"description" = ${toJsonbSql(data.description)}`,
      );
    }

    if (data.searchText !== undefined) {
      assignments.unshift(Prisma.sql`"searchText" = ${data.searchText}`);
    }

    if (data.budget !== undefined) {
      assignments.unshift(Prisma.sql`"budget" = ${data.budget}`);
    }

    if (data.spent !== undefined) {
      assignments.unshift(Prisma.sql`"spent" = ${data.spent}`);
    }

    if (data.locationId !== undefined) {
      assignments.unshift(Prisma.sql`"locationId" = ${data.locationId}`);
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

    const result = await prisma.$queryRaw<ProjectRecord[]>(Prisma.sql`
      UPDATE "Project"
      SET ${Prisma.join(assignments)}
      WHERE ${Prisma.join(filters, ' AND ')}
      RETURNING ${projectSelect}
    `);

    return result[0] ?? null;
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId?: string,
  ): Promise<ProjectRecord | null> => {
    const filters = [
      Prisma.sql`"id" = ${id}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<ProjectRecord[]>(Prisma.sql`
      UPDATE "Project"
      SET "isDeleted" = true, "status" = ${StatusEnum.INACTIVE}, "updatedAt" = NOW()
      WHERE ${Prisma.join(filters, ' AND ')}
      RETURNING ${projectSelect}
    `);

    return result[0] ?? null;
  },

  bulkCreate(
    data: CreateProjectInput[],
    options: { skipDuplicates?: boolean; transaction?: any } = {},
  ) {
    const prismaClient = options?.transaction || prisma;
    return prismaClient.project.createMany({
      data: data.map((item) => ({
        name: item.name,
        code: item.code,
        searchText: item.searchText,
        description: item.description || null,
        budget: item.budget,
        spent: item.spent || 0,
        locationId: item.locationId,
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
