import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import { randomUUID } from 'crypto';

type JsonObject = Record<string, unknown>;

export interface ProjectTaskRecord {
  id: string;
  name: JsonObject;
  code: string;
  assignee: JsonObject | null;
  plannedStartDate: Date | null;
  plannedEndDate: Date | null;
  actualStartDate: Date | null;
  actualEndDate: Date | null;
  taskStatus: string;
  taskProgress: number;
  totalDelayInDays: number;
  requiredApproval: boolean;
  lastApprovedDeadline: Date | null;
  projectBatchCode: string | null;
  stageId: string;
  projectId: string;
  domainId: string;
  status: StatusEnum;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectTaskInput {
  name: JsonObject;
  code: string;
  assignee?: JsonObject | null;
  plannedStartDate?: Date | null;
  plannedEndDate?: Date | null;
  actualStartDate?: Date | null;
  actualEndDate?: Date | null;
  taskStatus?: string;
  taskProgress?: number;
  totalDelayInDays?: number;
  requiredApproval?: boolean;
  lastApprovedDeadline?: Date | null;
  projectBatchCode?: string | null;
  stageId: string;
  projectId: string;
  domainId: string;
  status: StatusEnum;
}

export interface UpdateProjectTaskInput {
  name?: JsonObject;
  assignee?: JsonObject | null;
  plannedStartDate?: Date | null;
  plannedEndDate?: Date | null;
  actualStartDate?: Date | null;
  actualEndDate?: Date | null;
  taskStatus?: string;
  taskProgress?: number;
  totalDelayInDays?: number;
  requiredApproval?: boolean;
  lastApprovedDeadline?: Date | null;
  projectBatchCode?: string | null;
  status?: StatusEnum;
}

const projectTaskSelect = Prisma.sql`
  "id",
  "name",
  "code",
  "assignee",
  "plannedStartDate",
  "plannedEndDate",
  "actualStartDate",
  "actualEndDate",
  "taskStatus",
  "taskProgress",
  "totalDelayInDays",
  "requiredApproval",
  "lastApprovedDeadline",
  "projectBatchCode",
  "stageId",
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

function toDateSql(value: Date | null | undefined): Prisma.Sql {
  return value === null || value === undefined
    ? Prisma.sql`NULL`
    : Prisma.sql`${value}`;
}

export const projectTaskRepository = {
  create: async (data: CreateProjectTaskInput): Promise<ProjectTaskRecord> => {
    const id = randomUUID();

    const result = await prisma.$queryRaw<ProjectTaskRecord[]>(Prisma.sql`
      INSERT INTO "ProjectTask" (
        "id",
        "name",
        "code",
        "assignee",
        "plannedStartDate",
        "plannedEndDate",
        "actualStartDate",
        "actualEndDate",
        "taskStatus",
        "taskProgress",
        "totalDelayInDays",
        "requiredApproval",
        "lastApprovedDeadline",
        "projectBatchCode",
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
        ${JSON.stringify(data.name)}::jsonb,
        ${data.code},
        ${toJsonbSql(data.assignee)},
        ${toDateSql(data.plannedStartDate)},
        ${toDateSql(data.plannedEndDate)},
        ${toDateSql(data.actualStartDate)},
        ${toDateSql(data.actualEndDate)},
        ${data.taskStatus ?? 'PENDING'},
        ${data.taskProgress ?? 0},
        ${data.totalDelayInDays ?? 0},
        ${data.requiredApproval ?? false},
        ${toDateSql(data.lastApprovedDeadline)},
        ${data.projectBatchCode ?? null},
        ${data.stageId},
        ${data.projectId},
        ${data.domainId},
        ${data.status},
        false,
        NOW(),
        NOW()
      )
      RETURNING ${projectTaskSelect}
    `);

    return result[0] as ProjectTaskRecord;
  },

  findMany: async (
    domainId: string,
    projectId?: string,
    stageId?: string,
  ): Promise<ProjectTaskRecord[]> => {
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

    return prisma.$queryRaw<ProjectTaskRecord[]>(Prisma.sql`
      SELECT ${projectTaskSelect}
      FROM "ProjectTask"
      WHERE ${Prisma.join(filters, ' AND ')}
      ORDER BY "createdAt" DESC
    `);
  },

  findById: async (
    id: string,
    domainId: string,
  ): Promise<ProjectTaskRecord | null> => {
    const result = await prisma.$queryRaw<ProjectTaskRecord[]>(Prisma.sql`
      SELECT ${projectTaskSelect}
      FROM "ProjectTask"
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  findByCode: async (
    code: string,
    domainId: string,
    projectId: string,
    stageId: string,
  ): Promise<ProjectTaskRecord | null> => {
    const result = await prisma.$queryRaw<ProjectTaskRecord[]>(Prisma.sql`
      SELECT ${projectTaskSelect}
      FROM "ProjectTask"
      WHERE "code" = ${code}
        AND "domainId" = ${domainId}
        AND "projectId" = ${projectId}
        AND "stageId" = ${stageId}
        AND "isDeleted" = false
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateProjectTaskInput,
  ): Promise<ProjectTaskRecord | null> => {
    const assignments = [Prisma.sql`"updatedAt" = NOW()`];

    if (data.name !== undefined) {
      assignments.unshift(
        Prisma.sql`"name" = ${JSON.stringify(data.name)}::jsonb`,
      );
    }

    if (data.assignee !== undefined) {
      assignments.unshift(
        Prisma.sql`"assignee" = ${toJsonbSql(data.assignee)}`,
      );
    }

    if (data.plannedStartDate !== undefined) {
      assignments.unshift(
        Prisma.sql`"plannedStartDate" = ${toDateSql(data.plannedStartDate)}`,
      );
    }

    if (data.plannedEndDate !== undefined) {
      assignments.unshift(
        Prisma.sql`"plannedEndDate" = ${toDateSql(data.plannedEndDate)}`,
      );
    }

    if (data.actualStartDate !== undefined) {
      assignments.unshift(
        Prisma.sql`"actualStartDate" = ${toDateSql(data.actualStartDate)}`,
      );
    }

    if (data.actualEndDate !== undefined) {
      assignments.unshift(
        Prisma.sql`"actualEndDate" = ${toDateSql(data.actualEndDate)}`,
      );
    }

    if (data.taskStatus !== undefined) {
      assignments.unshift(Prisma.sql`"taskStatus" = ${data.taskStatus}`);
    }

    if (data.taskProgress !== undefined) {
      assignments.unshift(Prisma.sql`"taskProgress" = ${data.taskProgress}`);
    }

    if (data.totalDelayInDays !== undefined) {
      assignments.unshift(
        Prisma.sql`"totalDelayInDays" = ${data.totalDelayInDays}`,
      );
    }

    if (data.requiredApproval !== undefined) {
      assignments.unshift(
        Prisma.sql`"requiredApproval" = ${data.requiredApproval}`,
      );
    }

    if (data.lastApprovedDeadline !== undefined) {
      assignments.unshift(
        Prisma.sql`"lastApprovedDeadline" = ${toDateSql(
          data.lastApprovedDeadline,
        )}`,
      );
    }

    if (data.projectBatchCode !== undefined) {
      assignments.unshift(
        Prisma.sql`"projectBatchCode" = ${data.projectBatchCode}`,
      );
    }

    if (data.status !== undefined) {
      assignments.unshift(Prisma.sql`"status" = ${data.status}`);
    }

    const result = await prisma.$queryRaw<ProjectTaskRecord[]>(Prisma.sql`
      UPDATE "ProjectTask"
      SET ${Prisma.join(assignments)}
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      RETURNING ${projectTaskSelect}
    `);

    return result[0] ?? null;
  },

  softDelete: async (
    id: string,
    domainId: string,
  ): Promise<ProjectTaskRecord | null> => {
    const result = await prisma.$queryRaw<ProjectTaskRecord[]>(Prisma.sql`
      UPDATE "ProjectTask"
      SET "isDeleted" = true, "status" = ${StatusEnum.INACTIVE}, "updatedAt" = NOW()
      WHERE "id" = ${id} AND "domainId" = ${domainId} AND "isDeleted" = false
      RETURNING ${projectTaskSelect}
    `);

    return result[0] ?? null;
  },
};
