import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';

type JsonObject = Record<string, unknown>;

export interface ProjectRecord {
  id: string;
  name: JsonObject;
  code: string;
  projectCategoryId: string;
  description: JsonObject | null;
  budget: number;
  spent: number;
  locationId: string;
  domainId: string;
  status: StatusEnum;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectInput {
  name: JsonObject;
  code: string;
  projectCategoryId: string;
  description?: JsonObject | null;
  budget: number;
  spent?: number;
  locationId: string;
  domainId: string;
  status: StatusEnum;
}

export interface UpdateProjectInput {
  name?: JsonObject;
  description?: JsonObject | null;
  budget?: number;
  spent?: number;
  status?: StatusEnum;
}

const projectSelect = Prisma.sql`
  "id",
  "name",
  "code",
  "projectCategoryId",
  "description",
  "budget",
  "spent",
  "locationId",
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

export const projectRepository = {
  create: async (data: CreateProjectInput): Promise<ProjectRecord> => {
    const descriptionSql = toJsonbSql(data.description);

    const result = await prisma.$queryRaw<ProjectRecord[]>(Prisma.sql`
      INSERT INTO "Project" ("name", "code", "projectCategoryId", "description", "budget", "spent", "locationId", "domainId", "status", "isDeleted", "createdAt", "updatedAt")
      VALUES (
        ${JSON.stringify(data.name)}::jsonb,
        ${data.code},
        ${data.projectCategoryId},
        ${descriptionSql},
        ${data.budget},
        ${data.spent ?? 0},
        ${data.locationId},
        ${data.domainId},
        ${data.status},
        false,
        NOW(),
        NOW()
      )
      RETURNING *
    `);

    return result[0] as ProjectRecord;
  },

  findMany: async (domainId: string): Promise<ProjectRecord[]> => {
    return prisma.$queryRaw<ProjectRecord[]>(Prisma.sql`
      SELECT ${projectSelect}
      FROM "Project"
      WHERE "domainId" = ${domainId} AND "isDeleted" = false
      ORDER BY "createdAt" DESC
    `);
  },

  findById: async (
    id: string,
    domainId: string,
  ): Promise<ProjectRecord | null> => {
    const result = await prisma.$queryRaw<ProjectRecord[]>(Prisma.sql`
      SELECT ${projectSelect}
      FROM "Project"
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  findByCode: async (
    code: string,
    domainId: string,
  ): Promise<ProjectRecord | null> => {
    const result = await prisma.$queryRaw<ProjectRecord[]>(Prisma.sql`
      SELECT ${projectSelect}
      FROM "Project"
      WHERE "code" = ${code} AND "domainId" = ${domainId} AND "isDeleted" = false
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateProjectInput,
  ): Promise<ProjectRecord | null> => {
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

    if (data.budget !== undefined) {
      assignments.unshift(Prisma.sql`"budget" = ${data.budget}`);
    }

    if (data.spent !== undefined) {
      assignments.unshift(Prisma.sql`"spent" = ${data.spent}`);
    }

    if (data.status !== undefined) {
      assignments.unshift(Prisma.sql`"status" = ${data.status}`);
    }

    const result = await prisma.$queryRaw<ProjectRecord[]>(Prisma.sql`
      UPDATE "Project"
      SET ${Prisma.join(assignments)}
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      RETURNING ${projectSelect}
    `);

    return result[0] ?? null;
  },

  softDelete: async (
    id: string,
    domainId: string,
  ): Promise<ProjectRecord | null> => {
    const result = await prisma.$queryRaw<ProjectRecord[]>(Prisma.sql`
      UPDATE "Project"
      SET "isDeleted" = true, "status" = ${StatusEnum.INACTIVE}, "updatedAt" = NOW()
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      RETURNING ${projectSelect}
    `);

    return result[0] ?? null;
  },
};
