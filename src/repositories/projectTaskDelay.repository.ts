import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import { randomUUID } from 'crypto';

export interface ProjectTaskDelayRecord {
  id: string;
  taskId: string;
  requestedDelayInDays: number;
  delayReason: string;
  requestApproved: boolean;
  requestApprovalTime: Date | null;
  stageId: string;
  projectId: string;
  domainId: string;
  status: StatusEnum;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectTaskDelayInput {
  taskId: string;
  requestedDelayInDays: number;
  delayReason: string;
  requestApproved?: boolean;
  requestApprovalTime?: Date | null;
  stageId: string;
  projectId: string;
  domainId: string;
  status: StatusEnum;
}

export interface UpdateProjectTaskDelayInput {
  requestedDelayInDays?: number;
  delayReason?: string;
  requestApproved?: boolean;
  requestApprovalTime?: Date | null;
  status?: StatusEnum;
}

const projectTaskDelaySelect = Prisma.sql`
  "id",
  "taskId",
  "requestedDelayInDays",
  "delayReason",
  "requestApproved",
  "requestApprovalTime",
  "stageId",
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

export const projectTaskDelayRepository = {
  create: async (
    data: CreateProjectTaskDelayInput,
  ): Promise<ProjectTaskDelayRecord> => {
    const id = randomUUID();

    const result = await prisma.$queryRaw<ProjectTaskDelayRecord[]>(Prisma.sql`
      INSERT INTO "ProjectTaskDelay" (
        "id",
        "taskId",
        "requestedDelayInDays",
        "delayReason",
        "requestApproved",
        "requestApprovalTime",
        "stageId",
        "projectId",
        "domainId",
        "status",
        "isDeleted",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${id},
        ${data.taskId},
        ${data.requestedDelayInDays},
        ${data.delayReason},
        ${data.requestApproved ?? false},
        ${toDateSql(data.requestApprovalTime)},
        ${data.stageId},
        ${data.projectId},
        ${data.domainId},
        ${data.status},
        false,
        NOW(),
        NOW()
      )
      RETURNING ${projectTaskDelaySelect}
    `);

    return result[0] as ProjectTaskDelayRecord;
  },

  findMany: async (
    domainId: string,
    projectId?: string,
    stageId?: string,
    taskId?: string,
  ): Promise<ProjectTaskDelayRecord[]> => {
    const filters = [
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (projectId) {
      filters.push(Prisma.sql`"projectId" = ${projectId}`);
    }

    if (stageId) {
      filters.push(Prisma.sql`"stageId" = ${stageId}`);
    }

    if (taskId) {
      filters.push(Prisma.sql`"taskId" = ${taskId}`);
    }

    return prisma.$queryRaw<ProjectTaskDelayRecord[]>(Prisma.sql`
      SELECT ${projectTaskDelaySelect}
      FROM "ProjectTaskDelay"
      WHERE ${Prisma.join(filters, ' AND ')}
      ORDER BY "createdAt" DESC
    `);
  },

  findById: async (
    id: string,
    domainId: string,
  ): Promise<ProjectTaskDelayRecord | null> => {
    const result = await prisma.$queryRaw<ProjectTaskDelayRecord[]>(Prisma.sql`
      SELECT ${projectTaskDelaySelect}
      FROM "ProjectTaskDelay"
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateProjectTaskDelayInput,
  ): Promise<ProjectTaskDelayRecord | null> => {
    const assignments = [Prisma.sql`"updatedAt" = NOW()`];

    if (data.requestedDelayInDays !== undefined) {
      assignments.unshift(
        Prisma.sql`"requestedDelayInDays" = ${data.requestedDelayInDays}`,
      );
    }

    if (data.delayReason !== undefined) {
      assignments.unshift(Prisma.sql`"delayReason" = ${data.delayReason}`);
    }

    if (data.requestApproved !== undefined) {
      assignments.unshift(
        Prisma.sql`"requestApproved" = ${data.requestApproved}`,
      );
    }

    if (data.requestApprovalTime !== undefined) {
      assignments.unshift(
        Prisma.sql`"requestApprovalTime" = ${toDateSql(
          data.requestApprovalTime,
        )}`,
      );
    }

    if (data.status !== undefined) {
      assignments.unshift(Prisma.sql`"status" = ${data.status}`);
    }

    const result = await prisma.$queryRaw<ProjectTaskDelayRecord[]>(Prisma.sql`
      UPDATE "ProjectTaskDelay"
      SET ${Prisma.join(assignments)}
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      RETURNING ${projectTaskDelaySelect}
    `);

    return result[0] ?? null;
  },

  softDelete: async (
    id: string,
    domainId: string,
  ): Promise<ProjectTaskDelayRecord | null> => {
    const result = await prisma.$queryRaw<ProjectTaskDelayRecord[]>(Prisma.sql`
      UPDATE "ProjectTaskDelay"
      SET "isDeleted" = true, "status" = ${StatusEnum.INACTIVE}, "updatedAt" = NOW()
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      RETURNING ${projectTaskDelaySelect}
    `);

    return result[0] ?? null;
  },
};
