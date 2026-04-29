import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import { randomUUID } from 'crypto';

type JsonObject = Record<string, unknown>;

export interface ProjectStageRecord {
  id: string;
  name: JsonObject;
  code: string;
  description: JsonObject | null;
  progress: number | null;
  projectId: string;
  domainId: string;
  status: StatusEnum;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectStageInput {
  name: JsonObject;
  code: string;
  description?: JsonObject | null;
  progress?: number | null;
  projectId: string;
  domainId: string;
  status: StatusEnum;
}

export interface UpdateProjectStageInput {
  name?: JsonObject;
  description?: JsonObject | null;
  progress?: number | null;
  status?: StatusEnum;
}

const projectStageSelect = Prisma.sql`
  "id",
  "name",
  "code",
  "description",
  "progress",
  "projectId",
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

export const projectStageRepository = {
  create: async (
    data: CreateProjectStageInput,
  ): Promise<ProjectStageRecord> => {
    const id = randomUUID();
    const descriptionSql = toJsonbSql(data.description);

    const result = await prisma.$queryRaw<ProjectStageRecord[]>(Prisma.sql`
      INSERT INTO "ProjectStage" ("id", "name", "code", "description", "progress", "projectId", "domainId", "status", "isDeleted", "createdAt", "updatedAt")
      VALUES (
        ${id},
        ${JSON.stringify(data.name)}::jsonb,
        ${data.code},
        ${descriptionSql},
        ${data.progress ?? null},
        ${data.projectId},
        ${data.domainId},
        ${data.status},
        false,
        NOW(),
        NOW()
      )
      RETURNING *
    `);

    return result[0] as ProjectStageRecord;
  },

  findMany: async (
    domainId: string,
    projectId: string,
  ): Promise<ProjectStageRecord[]> => {
    return prisma.$queryRaw<ProjectStageRecord[]>(Prisma.sql`
      SELECT ${projectStageSelect}
      FROM "ProjectStage"
      WHERE "domainId" = ${domainId} AND "projectId" = ${projectId} AND "isDeleted" = false
      ORDER BY "createdAt" DESC
    `);
  },

  findById: async (
    id: string,
    domainId: string,
  ): Promise<ProjectStageRecord | null> => {
    const result = await prisma.$queryRaw<ProjectStageRecord[]>(Prisma.sql`
      SELECT ${projectStageSelect}
      FROM "ProjectStage"
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  findByCode: async (
    code: string,
    domainId: string,
    projectId: string,
  ): Promise<ProjectStageRecord | null> => {
    const result = await prisma.$queryRaw<ProjectStageRecord[]>(Prisma.sql`
      SELECT ${projectStageSelect}
      FROM "ProjectStage"
      WHERE "code" = ${code} AND "domainId" = ${domainId} AND "projectId" = ${projectId} AND "isDeleted" = false
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateProjectStageInput,
  ): Promise<ProjectStageRecord | null> => {
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

    if (data.progress !== undefined) {
      assignments.unshift(Prisma.sql`"progress" = ${data.progress}`);
    }

    if (data.status !== undefined) {
      assignments.unshift(Prisma.sql`"status" = ${data.status}`);
    }

    const result = await prisma.$queryRaw<ProjectStageRecord[]>(Prisma.sql`
      UPDATE "ProjectStage"
      SET ${Prisma.join(assignments)}
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      RETURNING ${projectStageSelect}
    `);

    return result[0] ?? null;
  },

  softDelete: async (
    id: string,
    domainId: string,
  ): Promise<ProjectStageRecord | null> => {
    const result = await prisma.$queryRaw<ProjectStageRecord[]>(Prisma.sql`
      UPDATE "ProjectStage"
      SET "isDeleted" = true, "status" = ${StatusEnum.INACTIVE}, "updatedAt" = NOW()
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      RETURNING ${projectStageSelect}
    `);

    return result[0] ?? null;
  },
};
