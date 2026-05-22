import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import { randomUUID } from 'crypto';

type JsonObject = Record<string, unknown>;

export interface ProjectCategoryRecord {
  id: string;
  name: JsonObject;
  code: string;
  searchText: string;
  description: string | null;
  domainId: string;
  status: StatusEnum;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectCategoryInput {
  name: JsonObject;
  code: string;
  searchText: string;
  description?: string | null;
  domainId: string;
  status: StatusEnum;
}

export interface UpdateProjectCategoryInput {
  name?: JsonObject;
  code?: string;
  searchText?: string;
  description?: string | null;
  status?: StatusEnum;
}

const projectCategorySelect = Prisma.sql`
  "id",
  "name",
  "code",
  "searchText",
  "description",
  "domainId",
  "status",
  "isDeleted",
  "createdAt",
  "updatedAt"
`;

export const projectCategoryRepository = {
  create: async (
    data: CreateProjectCategoryInput,
  ): Promise<ProjectCategoryRecord> => {
    const id = randomUUID();

    const result = await prisma.$queryRaw<ProjectCategoryRecord[]>(Prisma.sql`
      INSERT INTO "ProjectCategory" ("id", "name", "code", "searchText", "description", "domainId", "status", "isDeleted", "createdAt", "updatedAt")
      VALUES (${id}, ${JSON.stringify(data.name)}::jsonb, ${data.code}, ${data.searchText}, ${data.description ?? null}, ${data.domainId}, ${data.status}, false, NOW(), NOW())
      RETURNING *
    `);

    return result[0] as ProjectCategoryRecord;
  },

  findMany: async (
    domainId: string,
    searchKey?: string,
  ): Promise<ProjectCategoryRecord[]> => {
    const filters = [
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (searchKey) {
      filters.push(
        Prisma.sql`"searchText" LIKE ${`%${searchKey.toLowerCase()}%`}`,
      );
    }

    return prisma.$queryRaw<ProjectCategoryRecord[]>(Prisma.sql`
      SELECT ${projectCategorySelect}
      FROM "ProjectCategory"
      WHERE ${Prisma.join(filters, ' AND ')}
      ORDER BY "createdAt" DESC
    `);
  },

  findById: async (
    id: string,
    domainId: string,
  ): Promise<ProjectCategoryRecord | null> => {
    const result = await prisma.$queryRaw<ProjectCategoryRecord[]>(Prisma.sql`
      SELECT ${projectCategorySelect}
      FROM "ProjectCategory"
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  findByCode: async (
    code: string,
    domainId: string,
  ): Promise<ProjectCategoryRecord | null> => {
    const result = await prisma.$queryRaw<ProjectCategoryRecord[]>(Prisma.sql`
      SELECT ${projectCategorySelect}
      FROM "ProjectCategory"
      WHERE "code" = ${code} AND "domainId" = ${domainId} AND "isDeleted" = false
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateProjectCategoryInput,
  ): Promise<ProjectCategoryRecord | null> => {
    const assignments = [Prisma.sql`"updatedAt" = NOW()`];

    if (data.name !== undefined) {
      assignments.unshift(
        Prisma.sql`"name" = ${JSON.stringify(data.name)}::jsonb`,
      );
    }

    if (data.code !== undefined) {
      assignments.unshift(Prisma.sql`"code" = ${data.code}`);
    }

    if (data.searchText !== undefined) {
      assignments.unshift(Prisma.sql`"searchText" = ${data.searchText}`);
    }

    if (data.description !== undefined) {
      assignments.unshift(Prisma.sql`"description" = ${data.description}`);
    }

    if (data.status !== undefined) {
      assignments.unshift(Prisma.sql`"status" = ${data.status}`);
    }

    const result = await prisma.$queryRaw<ProjectCategoryRecord[]>(Prisma.sql`
      UPDATE "ProjectCategory"
      SET ${Prisma.join(assignments)}
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      RETURNING ${projectCategorySelect}
    `);

    return result[0] ?? null;
  },

  softDelete: async (
    id: string,
    domainId: string,
  ): Promise<ProjectCategoryRecord | null> => {
    const result = await prisma.$queryRaw<ProjectCategoryRecord[]>(Prisma.sql`
      UPDATE "ProjectCategory"
      SET "isDeleted" = true, "status" = ${StatusEnum.INACTIVE}, "updatedAt" = NOW()
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      RETURNING ${projectCategorySelect}
    `);

    return result[0] ?? null;
  },

  bulkCreate(
    data: CreateProjectCategoryInput[],
    options: { skipDuplicates?: boolean; transaction?: any } = {},
  ) {
    const prismaClient = options?.transaction || prisma;

    return prismaClient.projectCategory.createMany({
      data: data.map((item) => ({
        name: item.name,
        code: item.code,
        searchText: item.searchText,
        description: item.description || null,
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
