import { Prisma } from '@infra/database/prisma/generated/prisma/client';
import prisma from '@/infra/database/prisma/prisma.client';
import { StatusEnum } from '@constants/index';
import { randomUUID } from 'crypto';

type JsonObject = Record<string, unknown>;
type RelationDetails = Record<string, unknown> | null;

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
  adminId: string;
  stage?: RelationDetails;
  project?: RelationDetails;
  domain?: RelationDetails;
  admin?: RelationDetails;
  assigneeDetails?: RelationDetails;
  status: StatusEnum;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectTaskInput {
  name: JsonObject;
  code: string;
  searchText: string;
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
  adminId: string;
  status: StatusEnum;
}

export interface UpdateProjectTaskInput {
  name?: JsonObject;
  code?: string;
  searchText?: string;
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
  "adminId",
  "status",
  "isDeleted",
  "createdAt",
  "updatedAt"
`;

const projectTaskListSelect = Prisma.sql`
  pt."id",
  pt."name",
  pt."code",
  pt."plannedStartDate",
  pt."plannedEndDate",
  pt."actualStartDate",
  pt."actualEndDate",
  pt."taskStatus",
  pt."taskProgress",
  pt."totalDelayInDays",
  pt."requiredApproval",
  pt."lastApprovedDeadline",
  pt."projectBatchCode",
  NULL AS "assignee",
  jsonb_build_object(
    'stageId', ps."id",
    'name', ps."name",
    'code', ps."code"
  ) AS "stage",
  jsonb_build_object(
    'projectId', p."id",
    'name', p."name",
    'code', p."code"
  ) AS "project",
  jsonb_build_object(
    'domainId', d."id",
    'name', d."name",
    'email', d."email"
  ) AS "domain",
  jsonb_build_object(
    'adminId', a."id",
    'name', a."name",
    'email', a."email"
  ) AS "admin",
  CASE
    WHEN u."id" IS NULL THEN NULL
    ELSE jsonb_build_object(
      'userId', u."id",
      'name', u."name",
      'email', u."email"
    )
  END AS "assigneeDetails",
  pt."status",
  pt."isDeleted",
  pt."createdAt",
  pt."updatedAt"
`;

const projectTaskDetailSelect = Prisma.sql`
  pt."id",
  pt."name",
  pt."code",
  pt."assignee",
  pt."plannedStartDate",
  pt."plannedEndDate",
  pt."actualStartDate",
  pt."actualEndDate",
  pt."taskStatus",
  pt."taskProgress",
  pt."totalDelayInDays",
  pt."requiredApproval",
  pt."lastApprovedDeadline",
  pt."projectBatchCode",
  pt."stageId",
  pt."projectId",
  pt."domainId",
  pt."adminId",
  jsonb_build_object(
    'stageId', ps."id",
    'name', ps."name",
    'code', ps."code",
    'description', ps."description",
    'progress', ps."progress",
    'status', ps."status"
  ) AS "stage",
  jsonb_build_object(
    'projectId', p."id",
    'name', p."name",
    'code', p."code",
    'description', p."description",
    'budget', p."budget",
    'spent', p."spent",
    'locationId', p."locationId",
    'location', jsonb_build_object(
      'locationId', l."id",
      'name', l."name",
      'code', l."code",
      'type', l."type",
      'parentLocationId', l."parentLocationId",
      'status', l."status"
    ),
    'status', p."status"
  ) AS "project",
  jsonb_build_object(
    'domainId', d."id",
    'name', d."name",
    'email', d."email",
    'phoneCode', d."phoneCode",
    'phone', d."phone",
    'industry', d."industry",
    'status', d."status"
  ) AS "domain",
  jsonb_build_object(
    'adminId', a."id",
    'name', a."name",
    'email', a."email",
    'phoneCode', a."phoneCode",
    'phone', a."phone",
    'status', a."status"
  ) AS "admin",
  CASE
    WHEN u."id" IS NULL THEN NULL
    ELSE jsonb_build_object(
      'userId', u."id",
      'name', u."name",
      'email', u."email",
      'phoneCode', u."phoneCode",
      'phone', u."phone",
      'roleId', u."roleId",
      'status', u."status"
    )
  END AS "assigneeDetails",
  pt."status",
  pt."isDeleted",
  pt."createdAt",
  pt."updatedAt"
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
        "searchText",
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
        "adminId",
        "status",
        "isDeleted",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${id},
        ${JSON.stringify(data.name)}::jsonb,
        ${data.code},
        ${data.searchText},
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
        ${data.adminId},
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
    adminId?: string,
    projectId?: string,
    stageId?: string,
    searchKey?: string,
  ): Promise<ProjectTaskRecord[]> => {
    const filters = [
      Prisma.sql`pt."domainId" = ${domainId}`,
      Prisma.sql`pt."isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`pt."adminId" = ${adminId}`);
    }

    if (projectId) {
      filters.push(Prisma.sql`pt."projectId" = ${projectId}`);
    }

    if (stageId) {
      filters.push(Prisma.sql`pt."stageId" = ${stageId}`);
    }

    if (searchKey) {
      filters.push(
        Prisma.sql`pt."searchText" LIKE ${`%${searchKey.toLowerCase()}%`}`,
      );
    }

    return prisma.$queryRaw<ProjectTaskRecord[]>(Prisma.sql`
      SELECT ${projectTaskListSelect}
      FROM "ProjectTask" pt
      INNER JOIN "ProjectStage" ps ON ps."id" = pt."stageId"
      INNER JOIN "Project" p ON p."id" = pt."projectId"
      INNER JOIN "Location" l ON l."id" = p."locationId"
      INNER JOIN "Domain" d ON d."id" = pt."domainId"
      INNER JOIN "Admin" a ON a."id" = pt."adminId"
      LEFT JOIN "User" u ON u."id" = (pt."assignee"->>'userId')::uuid
      WHERE ${Prisma.join(filters, ' AND ')}
      ORDER BY pt."createdAt" DESC
    `);
  },

  findProjectIdsByAssignee: async (
    domainId: string,
    userId: string,
    adminId?: string,
  ): Promise<string[]> => {
    const filters = [
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
      Prisma.sql`"assignee"->>'userId' = ${userId}`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<{ projectId: string }[]>(Prisma.sql`
      SELECT DISTINCT "projectId"
      FROM "ProjectTask"
      WHERE ${Prisma.join(filters, ' AND ')}
    `);

    return result.map((row) => row.projectId);
  },

  findById: async (
    id: string,
    domainId: string,
    adminId?: string,
  ): Promise<ProjectTaskRecord | null> => {
    const filters = [
      Prisma.sql`pt."id" = ${id}`,
      Prisma.sql`pt."domainId" = ${domainId}`,
      Prisma.sql`pt."isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`pt."adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<ProjectTaskRecord[]>(Prisma.sql`
      SELECT ${projectTaskDetailSelect}
      FROM "ProjectTask" pt
      INNER JOIN "ProjectStage" ps ON ps."id" = pt."stageId"
      INNER JOIN "Project" p ON p."id" = pt."projectId"
      INNER JOIN "Location" l ON l."id" = p."locationId"
      INNER JOIN "Domain" d ON d."id" = pt."domainId"
      INNER JOIN "Admin" a ON a."id" = pt."adminId"
      LEFT JOIN "User" u ON u."id" = (pt."assignee"->>'userId')::uuid
      WHERE ${Prisma.join(filters, ' AND ')}
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  findByCode: async (
    code: string,
    domainId: string,
    projectId: string,
    stageId: string,
    adminId?: string,
  ): Promise<ProjectTaskRecord | null> => {
    const filters = [
      Prisma.sql`"code" = ${code}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"projectId" = ${projectId}`,
      Prisma.sql`"stageId" = ${stageId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<ProjectTaskRecord[]>(Prisma.sql`
      SELECT ${projectTaskSelect}
      FROM "ProjectTask"
      WHERE ${Prisma.join(filters, ' AND ')}
      LIMIT 1
    `);

    return result[0] ?? null;
  },

  update: async (
    id: string,
    domainId: string,
    data: UpdateProjectTaskInput,
    adminId?: string,
  ): Promise<ProjectTaskRecord | null> => {
    const assignments = [Prisma.sql`"updatedAt" = NOW()`];

    if (data.name !== undefined) {
      assignments.unshift(
        Prisma.sql`"name" = ${JSON.stringify(data.name)}::jsonb`,
      );
    }

    if (data.code !== undefined) {
      assignments.unshift(Prisma.sql`"code" = ${data.code}`);
    }

    if (data.assignee !== undefined) {
      assignments.unshift(
        Prisma.sql`"assignee" = ${toJsonbSql(data.assignee)}`,
      );
    }

    if (data.searchText !== undefined) {
      assignments.unshift(Prisma.sql`"searchText" = ${data.searchText}`);
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

    const filters = [
      Prisma.sql`"id" = ${id}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<ProjectTaskRecord[]>(Prisma.sql`
      UPDATE "ProjectTask"
      SET ${Prisma.join(assignments)}
      WHERE ${Prisma.join(filters, ' AND ')}
      RETURNING ${projectTaskSelect}
    `);

    return result[0] ?? null;
  },

  softDelete: async (
    id: string,
    domainId: string,
    adminId?: string,
  ): Promise<ProjectTaskRecord | null> => {
    const filters = [
      Prisma.sql`"id" = ${id}`,
      Prisma.sql`"domainId" = ${domainId}`,
      Prisma.sql`"isDeleted" = false`,
    ];

    if (adminId) {
      filters.push(Prisma.sql`"adminId" = ${adminId}`);
    }

    const result = await prisma.$queryRaw<ProjectTaskRecord[]>(Prisma.sql`
      UPDATE "ProjectTask"
      SET "isDeleted" = true, "status" = ${StatusEnum.INACTIVE}, "updatedAt" = NOW()
      WHERE ${Prisma.join(filters, ' AND ')}
      RETURNING ${projectTaskSelect}
    `);

    return result[0] ?? null;
  },

  bulkCreate(
    data: CreateProjectTaskInput[],
    options: { skipDuplicates?: boolean; transaction?: any } = {},
  ) {
    const prismaClient = options?.transaction || prisma;
    return prismaClient.projectTask.createMany({
      data: data.map((item) => ({
        name: item.name,
        code: item.code,
        searchText: item.searchText,
        assignee: item.assignee || null,
        plannedStartDate: item.plannedStartDate || null,
        plannedEndDate: item.plannedEndDate || null,
        actualStartDate: item.actualStartDate || null,
        actualEndDate: item.actualEndDate || null,
        taskStatus: item.taskStatus || 'pending',
        taskProgress: item.taskProgress || 0,
        totalDelayInDays: item.totalDelayInDays || 0,
        requiredApproval: item.requiredApproval || false,
        lastApprovedDeadline: item.lastApprovedDeadline || null,
        projectBatchCode: item.projectBatchCode || null,
        stageId: item.stageId,
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
