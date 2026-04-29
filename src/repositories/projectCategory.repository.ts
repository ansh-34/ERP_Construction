import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import { randomUUID } from 'crypto';

type JsonObject = Record<string, unknown>;

export interface ProjectCategoryRecord {
  id: string;
  name: JsonObject;
  code: string;
  description: JsonObject | null;
  domainId: string;
  status: StatusEnum;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectCategoryInput {
  name: JsonObject;
  code: string;
  description?: JsonObject | null;
  domainId: string;
  status: StatusEnum;
}

export interface UpdateProjectCategoryInput {
  name?: JsonObject;
  description?: JsonObject | null;
  status?: StatusEnum;
}

const projectCategorySelect = Prisma.sql`
  "id",
  "name",
  "code",
  "description",
  "domainId",
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

export const projectCategoryRepository = {
  create: async (
    data: CreateProjectCategoryInput,
  ): Promise<ProjectCategoryRecord> => {
    const id = randomUUID();
    const descriptionSql = toJsonbSql(data.description);

    const result = await prisma.$queryRaw<ProjectCategoryRecord[]>(Prisma.sql`
      INSERT INTO "ProjectCategory" ("id", "name", "code", "description", "domainId", "status", "isDeleted", "createdAt", "updatedAt")
      VALUES (${id}, ${JSON.stringify(data.name)}::jsonb, ${data.code}, ${descriptionSql}, ${data.domainId}, ${data.status}, false, NOW(), NOW())
      RETURNING *
    `);

    return result[0] as ProjectCategoryRecord;
  },

  findMany: async (domainId: string): Promise<ProjectCategoryRecord[]> => {
    return prisma.$queryRaw<ProjectCategoryRecord[]>(Prisma.sql`
      SELECT ${projectCategorySelect}
      FROM "ProjectCategory"
      WHERE "domainId" = ${domainId} AND "isDeleted" = false
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

    if (data.description !== undefined) {
      assignments.unshift(
        Prisma.sql`"description" = ${toJsonbSql(data.description)}`,
      );
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
};
