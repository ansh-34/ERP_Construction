import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { randomUUID } from 'crypto';
import type { TransactionClient } from '@/infra/database/prisma/transaction.js';

type RelationDetails = Record<string, unknown> | null;

export interface ProjectTaskImageRecord {
  id: string;
  imageId: string | null;
  imageUrl: string;
  description: string | null;
  taskId: string;
  stageId: string;
  projectId: string;
  domainId: string;
  adminId: string;
  image?: RelationDetails;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectTaskImageInput {
  imageId?: string | null;
  imageUrl: string;
  description?: string | null;
  taskId: string;
  stageId: string;
  projectId: string;
  domainId: string;
  adminId: string;
}

const projectTaskImageSelect = Prisma.sql`
  "id",
  "imageId",
  "imageUrl",
  "description",
  "taskId",
  "stageId",
  "projectId",
  "domainId",
  "adminId",
  "isDeleted",
  "createdAt",
  "updatedAt"
`;

export const projectTaskImageRepository = {
  create: async (
    data: CreateProjectTaskImageInput,
    options: { transaction?: TransactionClient } = {},
  ): Promise<ProjectTaskImageRecord> => {
    const id = randomUUID();
    const prismaClient = options.transaction || prisma;

    const result = await prismaClient.$queryRaw<ProjectTaskImageRecord[]>(
      Prisma.sql`
      INSERT INTO "ProjectTaskImage" (
        "id",
        "imageId",
        "imageUrl",
        "description",
        "taskId",
        "stageId",
        "projectId",
        "domainId",
        "adminId",
        "isDeleted",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${id},
        ${data.imageId ?? null},
        ${data.imageUrl},
        ${data.description ?? null},
        ${data.taskId},
        ${data.stageId},
        ${data.projectId},
        ${data.domainId},
        ${data.adminId},
        false,
        NOW(),
        NOW()
      )
      RETURNING ${projectTaskImageSelect}
    `,
    );

    return result[0] as ProjectTaskImageRecord;
  },

  findMany: async (
    domainId: string,
    adminId?: string,
    taskId?: string,
  ): Promise<ProjectTaskImageRecord[]> => {
    const filters = [
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    if (taskId) {
      filters.push(Prisma.sql`"taskId" = ${taskId}`);
    }

    return prisma.$queryRaw<ProjectTaskImageRecord[]>(Prisma.sql`
      SELECT ${projectTaskImageSelect}
      FROM "ProjectTaskImage"
      WHERE ${Prisma.join(filters, ' AND ')}
      ORDER BY "createdAt" DESC
    `);
  },

  findById: async (
    id: string,
    domainId: string,
    adminId?: string,
  ): Promise<ProjectTaskImageRecord | null> => {
    const filters = [
      Prisma.sql`"id" = ${id}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<ProjectTaskImageRecord[]>(Prisma.sql`
      SELECT ${projectTaskImageSelect}
      FROM "ProjectTaskImage"
      WHERE ${Prisma.join(filters, ' AND ')}
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId?: string,
  ): Promise<ProjectTaskImageRecord | null> => {
    const filters = [
      Prisma.sql`"id" = ${id}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<ProjectTaskImageRecord[]>(Prisma.sql`
      UPDATE "ProjectTaskImage"
      SET "isDeleted" = true, "updatedAt" = NOW()
      WHERE ${Prisma.join(filters, ' AND ')}
      RETURNING ${projectTaskImageSelect}
    `);

    return result[0] ?? null;
  },
};
